# AppDev2_Final_Project

```markdown
# Steps to launch the app

## Setup
1. Navigate into the directory.
2. Run the following commands:

```bash
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
python manage.py runserver
```

## User Details
Currently, there are 3 users in the application:

- Username: Admin,	Password: imp (Admin rights)
- Username: Prashant,	Password: upda
- Username: Sameer,	Password: sukha



### Overview
- I had created this web application as part of the final project for Modern Application Development 2 Subject in IITM B.Sc. Degree.
- This application uses a backend api server that is based on flask and frontend end uses vue.js.
- This application can be used for memory training. You can create question on varoius topics.

## Below is a detailed explanation of various pages in this application

- Review: This page will show decks that are currently in the system. Once you choose a deck it will give you a card from that deck.
- User Dashboard: This page shows all the test that loged in user had taken earlier and the scores that they got.
- Deck Dashboard: This oage shows ratings for different deck and card name given by all users.
- Deck Management: This page is only available when Admin user is loged in. This page can be used to modify curent deck or add new deck.
- Reporting:  This page is only available when Admin user is loged in. This page contains option to send email reminders to user who have not attempted and quiz recently.
