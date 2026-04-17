-- Fulfillment Transfer Migration

ALTER TABLE order_fulfillments ADD COLUMN IF NOT EXISTS transfer_request_id UUID REFERENCES stock_transfer_requests(id);
ALTER TABLE order_fulfillments ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;
ALTER TABLE order_fulfillments ADD COLUMN IF NOT EXISTS actual_delivery_date DATE;
ALTER TABLE order_fulfillments ADD COLUMN IF NOT EXISTS delivery_agent_name VARCHAR(255);
ALTER TABLE order_fulfillments ADD COLUMN IF NOT EXISTS delivery_agent_phone VARCHAR(20);

-- Fulfillment status workflow
-- pending -> processing -> picked -> in_transit -> delivered/failed
