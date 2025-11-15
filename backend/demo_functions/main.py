import pandas as pd
import numpy as np
from datetime import datetime, date, timedelta
from dateutil.relativedelta import relativedelta
import matplotlib.pyplot as plt

# -----------------------
# Sample JSON structure (1 main account)
# -----------------------
sample_json = {
    "account": {
        "id": "main",
        "name": "Main Account",
        "starting_balance": 3000.00,
        "currency": "EUR"
    },
    "fiscal_periods": ["202511", "202512"],
    "recurrent": [
        {"id": "r1", "type": "expense", "amount": 900, "description": "Rent", "frequency": "monthly", "start_date": "2025-01-01", "end_date": "2025-12-31"},
        {"id": "r2", "type": "expense", "amount": 50, "description": "Internet", "frequency": "monthly", "start_date": "2025-01-01", "end_date": None},
        {"id": "r3", "type": "income", "amount": 3200, "description": "Salary", "frequency": "monthly", "start_date": "2025-01-01", "end_date": None}
    ],
    "planned": [
        {"id": "p1", "type": "expense", "amount": 300, "description": "Holiday Saving", "date": "2025-11-15"},
        {"id": "p2", "type": "income", "amount": 100, "description": "Gift (Dec)", "date": "2025-12-10"}
    ],
    "actuals": [
        {"id": "a1", "type": "expense", "amount": 75.50, "description": "Groceries", "date": "2025-11-02"},
        {"id": "a2", "type": "expense", "amount": 130.00, "description": "Utilities", "date": "2025-11-05"},
        {"id": "a3", "type": "income", "amount": 3200.00, "description": "Salary (Nov)", "date": "2025-11-01"}
    ]
}

# -----------------------
# Helper functions
# -----------------------
def parse_date(v):
    if v is None:
        return None
    if isinstance(v, (datetime, date)):
        return v
    return datetime.strptime(v, "%Y-%m-%d").date()

def period_to_range(period):
    period = str(period)
    start = datetime.strptime(period, "%Y%m").date()
    end = (datetime.strptime(period, "%Y%m") + relativedelta(months=1) - timedelta(days=1)).date()
    return start, end

def expand_recurrent(recurrent, start, end):
    rows = []
    for index, r in recurrent.iterrows():
        cur = parse_date(r["start_date"])
        stop = parse_date(r["end_date"]) or end
        while cur <= stop and cur <= end:
            if cur >= start:
                rows.append({
                    "date": cur,
                    "type": r["type"],
                    "amount": r["amount"],
                    "description": r["description"]
                })
            if r["frequency"] == "monthly":
                cur += relativedelta(months=1)
            elif r["frequency"] == "weekly":
                cur += timedelta(weeks=1)
            elif r["frequency"] == "yearly":
                cur += relativedelta(years=1)
            else:
                break
    return pd.DataFrame(rows)




# -----------------------
# Summaries
# -----------------------
# def summarize_period(period, compare_to=None):
#     ledger = build_ledger(period)
#     summary = ledger.groupby("type")["signed_amount"].sum().reset_index()
#     net = summary["signed_amount"].sum()
#     balance_start = sample_json["account"]["starting_balance"]
#     balance_end = balance_start + net
#     print(f"\n=== Summary for {period} ===")
#     print(summary)
#     print(f"Net change: {net:.2f} EUR")
#     print(f"Expected end balance: {balance_end:.2f} EUR")

#     if compare_to:
#         other = build_ledger(compare_to)
#         diff = ledger.groupby("type")["signed_amount"].sum() - other.groupby("type")["signed_amount"].sum()
#         print(f"\nComparison vs {compare_to}:")
#         print(diff.fillna(0))

#     return summary, balance_end

# -----------------------
# Forecasting
# -----------------------
# def forecast_balance(start_period="202511", months=6):
#     balance = sample_json["account"]["starting_balance"]
#     results = []
#     start, _ = period_to_range(start_period)
#     for i in range(months):
#         period = (start + relativedelta(months=i)).strftime("%Y%m")
#         ledger = build_ledger(period)
#         net = ledger["signed_amount"].sum()
#         balance += net
#         results.append({"period": period, "net_change": net, "forecast_balance": balance})
#     forecast = pd.DataFrame(results)
#     print("\n=== Forecast ===")
#     print(forecast)
#     plt.plot(forecast["period"], forecast["forecast_balance"], marker="o")
#     plt.title("Forecasted Account Balance")
#     plt.xlabel("Period (YYYYMM)")
#     plt.ylabel("Balance (EUR)")
#     plt.grid(True)
#     plt.show()
#     return forecast

# -----------------------
# Available budget
# -----------------------
# def available_budget(period):
#     ledger = build_ledger(period)
#     incomes = ledger[ledger["type"]=="income"]["amount"].sum()
#     expenses = ledger[ledger["type"]=="expense"]["amount"].sum()
#     available = incomes - expenses
#     print(f"\n=== Available Budget for {period} ===")
#     print(f"Incomes: {incomes:.2f} EUR")
#     print(f"Expenses: {expenses:.2f} EUR")
#     print(f"Available to spend: {available:.2f} EUR")
#     return available

