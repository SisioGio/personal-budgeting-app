import pandas as pd
import numpy as np
from datetime import datetime, date, timedelta
from dateutil.relativedelta import relativedelta
import matplotlib.pyplot as plt
from main import *
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
        { "type": "E", "amount": 900, "description": "Rent", "frequency": "monthly", "start_date": "2025-01-01", "end_date": "2025-12-31"},
        {"type": "E", "amount": 50, "description": "Internet", "frequency": "monthly", "start_date": "2025-01-01", "end_date": None},
        
        {"type": "E", "amount": 100, "description": "Groceries", "frequency": "monthly", "start_date": "2025-01-01", "end_date": None},
        {"type": "E", "amount": 150, "description": "Utilities", "frequency": "monthly", "start_date": "2025-01-01", "end_date": None},
        
        {"type": "I", "amount": 3200, "description": "Salary", "frequency": "monthly", "start_date": "2025-01-01", "end_date": None}
    ],
    "planned": [
        {"type": "E", "amount": 300, "description": "Holiday", "date": "2025-11-15"},
        {"type": "I", "amount": 100, "description": "Gift", "date": "2025-12-10"},
        {"type": "I", "amount": 3000, "description": "Bonus", "date": "2026-03-25"}
    ],
    "actuals": [
        {"type": "E", "amount": 75.50, "description": "Groceries", "date": "2025-10-02"},
        {"type": "E", "amount": 130.00, "description": "Utilities", "date": "2025-10-05"},
        {"type": "I", "amount": 3100.00, "description": "Salary", "date": "2025-10-01"},
        {"type": "E", "amount": 75.50, "description": "Groceries", "date": "2025-11-02"},
        {"type": "E", "amount": 130.00, "description": "Utilities", "date": "2025-11-05"},
        {"type": "I", "amount": 3200.00, "description": "Salary", "date": "2025-11-01"},
     
    ]
}

def get_current_balance(starting_balance):
    actuals = pd.DataFrame(sample_json["actuals"])
    actuals["date"] = actuals["date"].apply(parse_date)
    actuals = actuals[actuals["date"] <= datetime.today().date()]
    actuals["signed_amount"] = actuals.apply(lambda r: -r["amount"] if r["type"]=="E" else r["amount"], axis=1)
    actuals_sum = actuals['signed_amount'].sum()
    return starting_balance+actuals_sum


def get_forecast(start,end):
    start=parse_date(start)
    end=parse_date(end)
    recurrent_df = pd.DataFrame(sample_json["recurrent"])
    planned_df = pd.DataFrame(sample_json["planned"])
    current_recur_expenses = expand_recurrent(recurrent_df,start,end)
    planned_df["date"] = planned_df["date"].apply(parse_date)
    current_planned_expenses = planned_df[(planned_df["date"]>= start) & (planned_df["date"] <= end)]
    ledger = pd.concat([current_recur_expenses, current_planned_expenses], ignore_index=True)
    ledger["signed_amount"] = ledger.apply(lambda r: -r["amount"] if r["type"]=="E" else r["amount"], axis=1)
    ledger = ledger.sort_values("date").reset_index(drop=True)
    ledger["period"] = pd.to_datetime(ledger["date"]).dt.strftime("%Y%m")
    
    
    
    return ledger


def forecast_summary(start,forecast):
    current_balance = get_current_balance(sample_json['account']['starting_balance'])
    
    
    forecast = forecast.groupby(['period'],as_index=False)['signed_amount'].sum()
    forecast = forecast.rename(columns={'signed_amount':'balance_mtd'})
    new_row = {
  
     "period": "START",
     "balance_mtd":current_balance
  
    }
    forecast = pd.concat([pd.DataFrame([new_row]), forecast], ignore_index=True)

    # Initialize lists for calculated values
    opening_balances = []
    closing_balances = []
    mom_growth = []
    ytd_change = []

    current_balance = 0
    current_year = None
    ytd_total = 0

    for idx, row in forecast.iterrows():
        if row["period"] == "START":
            current_balance = row["balance_mtd"]
            closing_balances.append(current_balance)
            opening_balances.append(None)
            mom_growth.append(None)
            ytd_change.append(None)
        else:
            # Determine year from period (YYYYMM)
            year = int(str(row["period"])[:4])
            if current_year is None or year != current_year:
                ytd_total = 0
                current_year = year
            
            # Opening = previous closing
            opening_balances.append(current_balance)
            
            # Apply month delta
            current_balance += row["balance_mtd"]
            closing_balances.append(current_balance)
            
            # Month-over-month growth
            prev_close = opening_balances[-1]
            growth = (row["balance_mtd"] / abs(prev_close)) * 100 if prev_close else None
            mom_growth.append(growth)
            
            # Update YTD
            ytd_total += row["balance_mtd"]
            ytd_change.append(ytd_total)

    # Add calculated columns
    forecast["opening_balance"] = opening_balances
    forecast["closing_balance"] = closing_balances
    forecast["mom_growth_%"] = mom_growth
    forecast["ytd_change"] = ytd_change

    # Rolling 3-month average (exclude START)
    forecast["rolling_3m_avg"] = (
        forecast.loc[forecast["period"] != "START", "balance_mtd"]
        .rolling(3, min_periods=1)
        .mean()
        .reindex(forecast.index)
    )
    return forecast



def forecast_against_actuals(start,end):

    actuals_df = pd.DataFrame(sample_json["actuals"])

    forecast_df = get_forecast(start,end)
    actuals_df["date"] = actuals_df["date"].apply(parse_date)
    actuals_df["period"] = pd.to_datetime(actuals_df["date"]).dt.strftime("%Y%m")
    actuals_df["signed_amount"] = actuals_df.apply(lambda r: -r["amount"] if r["type"]=="E" else r["amount"], axis=1)
    actuals_df = actuals_df.groupby(['period','description'], as_index=False)["amount"].sum()
    compare_df = pd.merge(forecast_df,actuals_df,on=['period','description'],how='left')
    renaming = {
        'amount_y':'actual',
        'amount_x':'budget'
    }
    compare_df =compare_df.rename(columns=renaming)
    compare_df=compare_df[['period','description','budget','actual']]
    compare_df['actual'] = compare_df['actual'].fillna(0)
    compare_df['variation'] = compare_df['budget'] - compare_df['actual']
    return compare_df
    
  
forecast = get_forecast('2025-11-10','2026-05-31')

print(forecast)

print(forecast_summary('2025-11-10',forecast))

# print(forecast_against_actuals('2025-11-01','2026-05-31'))

forecast.to_csv(r"C:\Users\Alessio\Projects\personal-finance-app\backend\forecast.csv", index=False)