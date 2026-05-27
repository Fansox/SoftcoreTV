export interface BoltOrderPrice {
  ride_price?: number;
  booking_fee?: number;
  toll_fee?: number;
  cancellation_fee?: number;
  tip?: number;
  net_earnings?: number;
  cash_discount?: number;
  in_app_discount?: number;
  commission?: number;
}

export interface BoltFleetOrder {
  order_reference: string;
  driver_name: string;
  driver_uuid: string;
  partner_uuid?: string;
  driver_phone?: string;
  payment_method?: string;
  payment_confirmed_timestamp?: number;
  order_created_timestamp: number;
  order_status?: string;
  vehicle_model?: string;
  vehicle_license_plate?: string;
  pickup_address?: string;
  destination_address?: string;
  ride_distance?: number;
  order_finished_timestamp?: number;
  order_price?: BoltOrderPrice;
}

export interface FinanceDriverSummary {
  driverUuid: string;
  driverName: string;
  driverPhone?: string | null;
  rides: number;
  grossRevenue: number;
  netEarnings: number;
  commission: number;
  tips: number;
  cashDiscount: number;
  inAppDiscount: number;
  adjustments: number;
  payableEstimate: number;
  vehicles: string[];
}

export interface FinanceBridgeOverview {
  range: {
    startTs: number;
    endTs: number;
    startIso: string;
    endIso: string;
  };
  totals: {
    orders: number;
    drivers: number;
    grossRevenue: number;
    netEarnings: number;
    commission: number;
    tips: number;
    cashDiscount: number;
    inAppDiscount: number;
    adjustments: number;
    payableEstimate: number;
  };
  drivers: FinanceDriverSummary[];
  lastSync?: {
    startedAt: string;
    finishedAt?: string | null;
    status: string;
    importedCount: number;
    updatedCount: number;
    errorMessage?: string | null;
  };
}
