from typing import Optional, List, Tuple, Dict

# Stock status thresholds (days remaining)
STOCK_DAYS_CRITICAL = 3
STOCK_DAYS_LOW = 7
STOCK_DAYS_WATCH = 14
STOCK_DAYS_HEALTHY = 30  # > 30 = OVERSTOCK

# Status labels
STATUS_CRITICAL = "CRITICAL"
STATUS_LOW = "LOW"
STATUS_WATCH = "WATCH"
STATUS_HEALTHY = "HEALTHY"
STATUS_OVERSTOCK = "OVERSTOCK"

# Reorder priority mapping
PRIORITY_URGENT = "URGENT"
PRIORITY_HIGH = "HIGH"
PRIORITY_MEDIUM = "MEDIUM"
PRIORITY_LOW = "LOW"
PRIORITY_NONE = "NONE"

# Variance thresholds
WASTAGE_RATE_NORMAL = 5.0    # %
WASTAGE_RATE_HIGH = 15.0     # %
CONSUMPTION_VARIANCE_NORMAL = 20.0  # % deviation

# Consumption comparison labels
VARIANCE_NORMAL = "NORMAL"
VARIANCE_ABOVE = "ABOVE_EXPECTED"
VARIANCE_BELOW = "BELOW_EXPECTED"
VARIANCE_INSUFFICIENT = "INSUFFICIENT_DATA"

def average_daily_consumption(total_consumed: float, num_days: int) -> float:
    """Calculate the average daily consumption."""
    if num_days <= 0 or total_consumed <= 0:
        return 0.0
    return total_consumed / num_days

def days_until_stockout(current_stock: float, avg_daily_consumption: float) -> Optional[float]:
    """Calculate days until the stock runs out."""
    if current_stock <= 0:
        return 0.0
    if avg_daily_consumption <= 0:
        return None
    return current_stock / avg_daily_consumption

def consumption_growth(current_period: float, previous_period: float) -> float:
    """Calculate the percentage growth in consumption."""
    if previous_period == 0.0 and current_period == 0.0:
        return 0.0
    if previous_period == 0.0:
        return 100.0 if current_period > 0 else 0.0
    return ((current_period - previous_period) / previous_period) * 100

def wastage_rate(total_wastage: float, total_consumption: float) -> float:
    """Calculate the wastage rate as a percentage."""
    denominator = total_consumption + total_wastage
    if denominator == 0:
        return 0.0
    return (total_wastage / denominator) * 100

def classify_stock_status(days_remaining: Optional[float]) -> str:
    """Classify the stock status based on days remaining."""
    if days_remaining is None:
        return STATUS_HEALTHY
    if days_remaining < STOCK_DAYS_CRITICAL:
        return STATUS_CRITICAL
    if days_remaining < STOCK_DAYS_LOW:
        return STATUS_LOW
    if days_remaining < STOCK_DAYS_WATCH:
        return STATUS_WATCH
    if days_remaining <= STOCK_DAYS_HEALTHY:
        return STATUS_HEALTHY
    return STATUS_OVERSTOCK

def reorder_recommendation(avg_daily_consumption: float, lead_time_days: int, safety_stock: float, current_stock: float) -> dict:
    """Generate a reorder recommendation."""
    expected_lead_time_consumption = avg_daily_consumption * lead_time_days
    recommended = expected_lead_time_consumption + safety_stock - current_stock
    recommended_quantity = max(0.0, recommended)
    
    days_rem = days_until_stockout(current_stock, avg_daily_consumption)
    status = classify_stock_status(days_rem)
    
    if status == STATUS_CRITICAL:
        priority = PRIORITY_URGENT
    elif status == STATUS_LOW:
        priority = PRIORITY_HIGH
    elif status == STATUS_WATCH:
        priority = PRIORITY_MEDIUM
    elif status == STATUS_HEALTHY:
        priority = PRIORITY_LOW
    else:
        priority = PRIORITY_NONE
        
    return {
        "expected_lead_time_consumption": expected_lead_time_consumption,
        "recommended_quantity": recommended_quantity,
        "priority": priority
    }

def compare_inventory_to_sales(expected_consumption: float, actual_consumption: float) -> dict:
    """Compare inventory usage against expected sales."""
    if expected_consumption is None or expected_consumption <= 0:
        return {
            "label": VARIANCE_INSUFFICIENT,
            "variance_percentage": None
        }
        
    variance = ((actual_consumption - expected_consumption) / expected_consumption) * 100
    
    if abs(variance) <= CONSUMPTION_VARIANCE_NORMAL:
        label = VARIANCE_NORMAL
    elif variance > 0:
        label = VARIANCE_ABOVE
    else:
        label = VARIANCE_BELOW
        
    return {
        "label": label,
        "variance_percentage": variance
    }

def generate_item_strengths_weaknesses(days_remaining: Optional[float], wastage_pct: float, growth: Optional[float], sales_label: str, avg_daily: float) -> tuple[list[str], list[str]]:
    """Generate strengths and weaknesses strings for the item."""
    strengths = []
    weaknesses = []
    
    if days_remaining is None or days_remaining > 14:
        strengths.append("Adequate stock levels")
    if wastage_pct < 3:
        strengths.append("Minimal wastage")
    if growth is not None and growth < -10:
        strengths.append("Consumption decreasing (cost saving)")
    if sales_label == VARIANCE_NORMAL:
        strengths.append("Consumption aligns with sales")
        
    if days_remaining is not None:
        if days_remaining < 3:
            weaknesses.append("Critical stock level — immediate restock needed")
        elif days_remaining < 7:
            weaknesses.append("Low stock — approaching reorder point")
    if wastage_pct > WASTAGE_RATE_HIGH:
        weaknesses.append("High wastage rate")
    if sales_label == VARIANCE_ABOVE:
        weaknesses.append("Consumption exceeds expected usage from sales")
        
    return strengths, weaknesses
