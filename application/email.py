import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def SendEmail(name, receiver_address):
    mail_content = "Hi " + str(name) + ''',

We have noticed there has not been any activity on your account for the last 24 hours.

We would recommend you yo visit http://localhost:8080/ and explore new cards and increase your knowledge.

Happy Learning!

Regards,
Flash Card Team'''
    sender_address = 'moizalitajmailsender@gmail.com'
    sender_pass = 'ProjectIITM@123'
    message = MIMEMultipart()
    message['From'] = sender_address
    message['To'] = receiver_address
    message['Subject'] = 'Reminder - FlashCard.com'
    message.attach(MIMEText(mail_content, 'plain'))
    session = smtplib.SMTP('smtp.gmail.com', 587)
    session.starttls()
    session.login(sender_address, sender_pass)
    text = message.as_string()
    session.sendmail(sender_address, receiver_address, text)
    session.quit()
    print("Mail Sent to", receiver_address)

