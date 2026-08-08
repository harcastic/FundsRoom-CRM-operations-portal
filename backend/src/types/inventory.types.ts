export type MovementType = 'IN' | 'OUT';

export interface StockMovement {
  id: number;
  product_id: number;
  quantity: number;
  movement_type: MovementType;
  reason: string;
  created_by: number;
  created_at: Date;
  creator_name?: string;
}
