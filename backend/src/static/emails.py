ACCOUNT_CONFIRMATION_TEMPLATE ="""<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Confirm Your Registration</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(to right, #0f172a, #1e293b);
        color: white;
        padding: 30px;
        margin: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: #0f172a;
        border-radius: 12px;
        box-shadow: 0 0 15px rgba(59,130,246,0.5);
        padding: 40px;
      }
      h1 {
        color: #38bdf8;
        text-align: center;
      }
      p {
        line-height: 1.6;
        font-size: 16px;
      }
      .button {
        display: inline-block;
        margin-top: 30px;
        padding: 14px 28px;
        background: linear-gradient(to right, #3b82f6, #06b6d4);
        color: white;
        font-weight: bold;
        text-decoration: none;
        border-radius: 8px;
        text-align: center;
      }
      .footer {
        text-align: center;
        margin-top: 40px;
        font-size: 12px;
        color: #94a3b8;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Welcome to Agents4People 🚀</h1>
      <p>Hi there,</p>
      <p>Thank you for signing up! You're just one step away from unlocking powerful cold email generation capabilities.</p>
      <p>Please click the button below to confirm your registration:</p>
      <a href="{{confirmation_url}}" class="button">Confirm My Email</a>
      <p>If the button doesn't work, copy and paste the link below into your browser:</p>
      <p style="word-break: break-all;">{{confirmation_url}}</p>
      <div class="footer">
        © 2025 Agents4People.com • All rights reserved.
      </div>
    </div>
  </body>
</html>"""


PASSWORD_RESET_TEMPLATE ="""
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset Request</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(to right, #0f172a, #1e293b);
        color: white;
        padding: 30px;
        margin: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: #0f172a;
        border-radius: 12px;
        box-shadow: 0 0 15px rgba(59,130,246,0.5);
        padding: 40px;
      }
      h1 {
        color: #38bdf8;
        text-align: center;
      }
      p {
        line-height: 1.6;
        font-size: 16px;
      }
      .button {
        display: inline-block;
        margin-top: 30px;
        padding: 14px 28px;
        background: linear-gradient(to right, #3b82f6, #06b6d4);
        color: white;
        font-weight: bold;
        text-decoration: none;
        border-radius: 8px;
        text-align: center;
      }
      .footer {
        text-align: center;
        margin-top: 40px;
        font-size: 12px;
        color: #94a3b8;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Password Reset Request 🔒</h1>
      <p>Hi there,</p>
      <p>We received a request to reset your password. Please click the link below to reset it:</p>
      <a href="{{reset_url}}" class="button">Reset My Password</a>
      <p>If the button doesn't work, copy and paste the following URL into your browser:</p>
      <p style="word-break: break-all;">{{reset_url}}</p>
      <div class="footer">
        © 2025 Agents4People.com • All rights reserved.
      </div>
    </div>
  </body>
</html>

"""