import { prisma } from "@/lib/services/prisma";
import { env } from "@/lib/config/env";
import { fetchBoltFinanceOrders } from "@/lib/finance/boltFinanceClient";
import type { BoltFleetOrder, FinanceBridgeOverview, FinanceDriverSummary } from "@/lib/finance/types";

const toNumber = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : 0);
const roundMoney = (value: number) => Math.round(value * 100) / 100;

const defaultRange = () => {
  const end = new Date();
  const start = new Date(end);
  start.setHours(0, 0, 0, 0);
  return { startTs: Math.floor(start.getTime() / 1000), endTs: Math.floor(end.getTime() / 1000) };
};

export const parseFinanceRange = (searchParams: URLSearchParams) => {
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!from && !to) return defaultRange();

  const start = from ? new Date(`${from}T00:00:00+01:00`) : new Date();
  const end = to ? new Date(`${to}T23:59:59+01:00`) : new Date();

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return defaultRange();
  return { startTs: Math.floor(start.getTime() / 1000), endTs: Math.floor(end.getTime() / 1000) };
};

const normalizeOrder = (order: BoltFleetOrder, companyId: string, companyName?: string) => {
  const price = order.order_price ?? {};
  return {
    orderReference: order.order_reference,
    companyId,
    companyName,
    driverUuid: order.driver_uuid,
    driverName: order.driver_name,
    driverPhone: order.driver_phone ?? null,
    partnerUuid: order.partner_uuid ?? null,
    vehicleLicensePlate: order.vehicle_license_plate ?? null,
    vehicleModel: order.vehicle_model ?? null,
    paymentMethod: order.payment_method ?? null,
    paymentConfirmedTimestamp: order.payment_confirmed_timestamp ?? null,
    orderCreatedTimestamp: order.order_created_timestamp,
    orderFinishedTimestamp: order.order_finished_timestamp ?? null,
    orderStatus: order.order_status ?? null,
    pickupAddress: order.pickup_address ?? null,
    destinationAddress: order.destination_address ?? null,
    rideDistance: typeof order.ride_distance === "number" ? order.ride_distance : null,
    ridePrice: toNumber(price.ride_price),
    bookingFee: toNumber(price.booking_fee),
    tollFee: toNumber(price.toll_fee),
    cancellationFee: toNumber(price.cancellation_fee),
    tip: toNumber(price.tip),
    netEarnings: toNumber(price.net_earnings),
    cashDiscount: toNumber(price.cash_discount),
    inAppDiscount: toNumber(price.in_app_discount),
    commission: toNumber(price.commission),
    rawJson: order as unknown as object
  };
};

export async function syncFinanceBridge(range: { startTs: number; endTs: number }) {
  if (env.dataProvider !== "bolt") {
    throw new Error("Finance Bridge requires DATA_PROVIDER=bolt");
  }
  if (env.boltCompanyIds.length === 0) {
    throw new Error("Set BOLT_COMPANY_IDS to one or more Bolt company IDs");
  }

  const syncRun = await prisma.financeSyncRun.create({
    data: {
      status: "running",
      startTs: range.startTs,
      endTs: range.endTs,
      companyId: env.boltCompanyIds.join(",")
    }
  });

  let importedCount = 0;
  let updatedCount = 0;

  try {
    for (const companyId of env.boltCompanyIds) {
      const result = await fetchBoltFinanceOrders({ companyId, startTs: range.startTs, endTs: range.endTs });
      for (const order of result.orders) {
        const data = normalizeOrder(order, result.companyId, result.companyName);
        const existing = await prisma.boltFinanceOrder.findUnique({ where: { orderReference: data.orderReference } });
        await prisma.boltFinanceOrder.upsert({
          where: { orderReference: data.orderReference },
          create: data,
          update: data
        });
        if (existing) updatedCount += 1;
        else importedCount += 1;
      }
    }

    await prisma.financeSyncRun.update({
      where: { id: syncRun.id },
      data: { status: "success", finishedAt: new Date(), importedCount, updatedCount }
    });
    return { importedCount, updatedCount };
  } catch (error) {
    await prisma.financeSyncRun.update({
      where: { id: syncRun.id },
      data: {
        status: "failed",
        finishedAt: new Date(),
        importedCount,
        updatedCount,
        errorMessage: error instanceof Error ? error.message : "Unknown finance sync error"
      }
    });
    throw error;
  }
}

export async function getFinanceOverview(range: { startTs: number; endTs: number }): Promise<FinanceBridgeOverview> {
  const orders = await prisma.boltFinanceOrder.findMany({
    where: {
      orderCreatedTimestamp: { gte: range.startTs, lte: range.endTs }
    },
    include: { adjustments: true },
    orderBy: [{ driverName: "asc" }, { orderCreatedTimestamp: "asc" }]
  });

  const lastSync = await prisma.financeSyncRun.findFirst({ orderBy: { startedAt: "desc" } });
  const byDriver = new Map<string, FinanceDriverSummary>();

  for (const order of orders) {
    const current = byDriver.get(order.driverUuid) ?? {
      driverUuid: order.driverUuid,
      driverName: order.driverName,
      driverPhone: order.driverPhone,
      rides: 0,
      grossRevenue: 0,
      netEarnings: 0,
      commission: 0,
      tips: 0,
      cashDiscount: 0,
      inAppDiscount: 0,
      adjustments: 0,
      payableEstimate: 0,
      vehicles: []
    };

    const gross = order.ridePrice + order.bookingFee + order.tollFee + order.cancellationFee + order.tip;
    const adjustments = order.adjustments.reduce((sum, item) => sum + item.amount, 0);

    current.rides += 1;
    current.grossRevenue += gross;
    current.netEarnings += order.netEarnings;
    current.commission += order.commission;
    current.tips += order.tip;
    current.cashDiscount += order.cashDiscount;
    current.inAppDiscount += order.inAppDiscount;
    current.adjustments += adjustments;
    current.payableEstimate += order.netEarnings + order.tip + adjustments;
    if (order.vehicleLicensePlate && !current.vehicles.includes(order.vehicleLicensePlate)) current.vehicles.push(order.vehicleLicensePlate);

    byDriver.set(order.driverUuid, current);
  }

  const drivers = [...byDriver.values()]
    .map((driver) => ({
      ...driver,
      grossRevenue: roundMoney(driver.grossRevenue),
      netEarnings: roundMoney(driver.netEarnings),
      commission: roundMoney(driver.commission),
      tips: roundMoney(driver.tips),
      cashDiscount: roundMoney(driver.cashDiscount),
      inAppDiscount: roundMoney(driver.inAppDiscount),
      adjustments: roundMoney(driver.adjustments),
      payableEstimate: roundMoney(driver.payableEstimate)
    }))
    .sort((a, b) => b.netEarnings - a.netEarnings);

  const totals = drivers.reduce(
    (acc, driver) => ({
      orders: acc.orders + driver.rides,
      drivers: acc.drivers,
      grossRevenue: acc.grossRevenue + driver.grossRevenue,
      netEarnings: acc.netEarnings + driver.netEarnings,
      commission: acc.commission + driver.commission,
      tips: acc.tips + driver.tips,
      cashDiscount: acc.cashDiscount + driver.cashDiscount,
      inAppDiscount: acc.inAppDiscount + driver.inAppDiscount,
      adjustments: acc.adjustments + driver.adjustments,
      payableEstimate: acc.payableEstimate + driver.payableEstimate
    }),
    { orders: 0, drivers: drivers.length, grossRevenue: 0, netEarnings: 0, commission: 0, tips: 0, cashDiscount: 0, inAppDiscount: 0, adjustments: 0, payableEstimate: 0 }
  );

  return {
    range: {
      startTs: range.startTs,
      endTs: range.endTs,
      startIso: new Date(range.startTs * 1000).toISOString(),
      endIso: new Date(range.endTs * 1000).toISOString()
    },
    totals: {
      ...totals,
      grossRevenue: roundMoney(totals.grossRevenue),
      netEarnings: roundMoney(totals.netEarnings),
      commission: roundMoney(totals.commission),
      tips: roundMoney(totals.tips),
      cashDiscount: roundMoney(totals.cashDiscount),
      inAppDiscount: roundMoney(totals.inAppDiscount),
      adjustments: roundMoney(totals.adjustments),
      payableEstimate: roundMoney(totals.payableEstimate)
    },
    drivers,
    lastSync: lastSync
      ? {
          startedAt: lastSync.startedAt.toISOString(),
          finishedAt: lastSync.finishedAt?.toISOString() ?? null,
          status: lastSync.status,
          importedCount: lastSync.importedCount,
          updatedCount: lastSync.updatedCount,
          errorMessage: lastSync.errorMessage
        }
      : undefined
  };
}

export const financeOverviewToCsv = (overview: FinanceBridgeOverview) => {
  const header = ["Driver", "Phone", "Rides", "Vehicles", "Gross Revenue", "Net Earnings", "Commission", "Tips", "Cash Discount", "In-App Discount", "Adjustments", "Payable Estimate"];
  const rows = overview.drivers.map((driver) => [
    driver.driverName,
    driver.driverPhone ?? "",
    String(driver.rides),
    driver.vehicles.join(" | "),
    String(driver.grossRevenue),
    String(driver.netEarnings),
    String(driver.commission),
    String(driver.tips),
    String(driver.cashDiscount),
    String(driver.inAppDiscount),
    String(driver.adjustments),
    String(driver.payableEstimate)
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
    .join("\n");
};
