from flask import request, render_template, current_app as app, session, make_response, url_for
from werkzeug.utils import redirect
from datetime import date
from application.models import Deck_Data,Deck_Scores,Users
from application.database import db
import os
import json
from datetime import datetime
import time
import random
import hashlib
from application.email import *
app.secret_key = "5e7d4994c590a86e04d95d4dc2710decafd09825576154768ce3f879c69aec13"

def encrypt_string(hash_string):
    signature = hashlib.sha256(hash_string.encode()).hexdigest()
    return signature

@app.route("/")
def vue():
    return render_template("Vue.html")

@app.route('/loginapi', methods=["POST"])
def loginapi():
    content_type = request.headers.get('Content-Type')
    if (content_type == 'application/json'):
        jsondata = request.json
        username = jsondata["username"]
        password = encrypt_string(jsondata["password"])
        dump = Users.query.filter_by(username=username).with_entities(Users.username,Users.password).distinct().all()
        try:
            for i in dump:
                user = i[0]
                passkey = i[1]
                if (user == username) and (passkey == password):
                    session['username'] = user
                    Deck_Scores.query.filter_by(username=user, score=None).delete()
                    db.session.commit()
                    return json.dumps("success")
        except:
            return json.dumps("server error")
        return json.dumps("failure")

@app.route('/logoutapi')
def logoutapi():
    session.pop('username', None)
    return json.dumps("success")

@app.route('/islogedin')
def islogedin():
    if 'username' in session:
        user_name = session['username']
        return json.dumps(user_name)
    else:
        return json.dumps("failure#@!#notlogedin")

@app.route('/reviewapi')
def review_deck_selectionapi():
    if 'username' in session:
        dump_deck_name = Deck_Data.query.with_entities(Deck_Data.deck_master_name).distinct().order_by(Deck_Data.deck_master_name).all()
        output = []
        for i in dump_deck_name:
            outputdict = {}
            outputdict["name"] = i[0]
            outputdict["path"] = "/reviewa/" + str(i[0])
            output.append(outputdict)

        return json.dumps(output)
    else:
        return json.dumps("login first")

@app.route('/getquestionapi/<deck_master_name>')
def getquestionapi(deck_master_name):
    if 'username' in session:
        deck_name_done_pre = Deck_Scores.query.filter_by(username=session['username'],deck_master_name=deck_master_name).filter(Deck_Scores.score.isnot(None)).with_entities(Deck_Scores.deck_name).all()
        deck_name_done = []
        for i in deck_name_done_pre:
            deck_name_done.append(i[0])
        all_deck_name_pre = Deck_Data.query.filter_by(deck_master_name=deck_master_name).with_entities(Deck_Data.deck_name).distinct().all()
        all_deck_name = []
        for i in all_deck_name_pre:
            all_deck_name.append(i[0])
        deck_name_not_done = []
        for i in all_deck_name:
            if i not in deck_name_done:
                deck_name_not_done.append(i)
        if not deck_name_not_done:
            question_deckname = deck_name_done[(random.randint(0, len(deck_name_done) - 1))]
        else:
            question_deckname = deck_name_not_done[(random.randint(0, len(deck_name_not_done) - 1))]
        dump = Deck_Data.query.filter_by(deck_name=question_deckname).first()
        deck_name = dump.deck_name
        deck_master_name = dump.deck_master_name
        rating = dump.deck_rating
        rating_count = dump.deck_rating_count
        deck_id = dump.deck_id
        start_time = datetime.now().strftime("%d/%m/%y %H:%M:%S")
        start_time_perf = time.perf_counter()
        score_details_partial_update = Deck_Scores(username=session['username'], deck_name=deck_name,deck_master_name=deck_master_name,deck_id=deck_id,start_time=start_time, start_time_perf=start_time_perf)
        db.session.add(score_details_partial_update)
        db.session.commit()
        field_id = Deck_Scores.query.filter_by(username=session['username'], deck_name=deck_name,start_time=start_time, ).first().field_id
        outputdict = {}
        outputdict["deck_name_for_question"] = dump.deck_name
        outputdict["deck_option_1"] = dump.deck_option_1
        outputdict["deck_option_2"] = dump.deck_option_2
        outputdict["deck_option_3"] = dump.deck_option_3
        outputdict["deck_option_4"] = dump.deck_option_4
        outputdict["fld_id"] = field_id
        outputdict["rating"] = rating
        outputdict["rating_count"] = rating_count
        return json.dumps(outputdict)
    else:
        return json.dumps("login first")

@app.route('/submitanswer/<int:field_id>', methods=["POST"])
def submitanswer(field_id):
    if 'username' in session:
        content_type = request.headers.get('Content-Type')
        if (content_type == 'application/json'):
            jsondata = request.json
            answer = jsondata["answer"]
            deck_score_details = Deck_Scores.query.filter_by(field_id=field_id).first()
            deck_data_details = Deck_Data.query.filter_by(deck_name=deck_score_details.deck_name).first()
            if answer == deck_data_details.deck_answer:
                # answer is correct
                end_time = datetime.now().strftime("%d/%m/%y %H:%M:%S")
                end_time_perf = time.perf_counter()
                if (end_time_perf - deck_score_details.start_time_perf) >= 300:
                    score = 0
                else:
                    score = round(10 - ((10 / 300) * (end_time_perf - deck_score_details.start_time_perf)), 2)
                deck_score_details.end_time = end_time
                deck_score_details.end_time_perf = end_time_perf
                deck_score_details.score = score
                db.session.commit()
                outputdict = {}
                outputdict["status"] = "success"
                outputdict["deck_id"] = deck_data_details.deck_id
                return json.dumps(outputdict)
            else:
                end_time = datetime.now().strftime("%d/%m/%y %H:%M:%S")
                end_time_perf = time.perf_counter()
                score = 0
                deck_score_details.end_time = end_time
                deck_score_details.end_time_perf = end_time_perf
                deck_score_details.score = score
                db.session.commit()
                outputdict = {}
                outputdict["deck_id"] = deck_data_details.deck_id
                outputdict["status"] = str(deck_data_details.deck_answer)
                return json.dumps(outputdict)
    else:
        return json.dumps("login first")

@app.route('/ratingapi/<int:deck_id>', methods=["POST"])
def ratingapi(deck_id):
    if 'username' in session:
        content_type = request.headers.get('Content-Type')
        if (content_type == 'application/json'):
            jsondata = request.json
            rating = jsondata["rating"]
            deck_data_details = Deck_Data.query.filter_by(deck_id=deck_id).first()
            current_rating = deck_data_details.deck_rating
            current_rating_count = deck_data_details.deck_rating_count
            if current_rating != 'None':
                new_rating = ((current_rating * current_rating_count) + int(rating)) / (current_rating_count + 1)
                deck_data_details.deck_rating = new_rating
                deck_data_details.deck_rating_count = current_rating_count + 1
                db.session.commit()
            else:
                new_rating = rating
                new_count = 1
                deck_data_details.deck_rating = new_rating
                deck_data_details.deck_rating_count = new_count
                db.session.commit()
            deck_master_name = Deck_Data.query.filter_by(deck_id=deck_id).first().deck_master_name
            return json.dumps("success")
    else:
        return json.dumps("login first")

@app.route('/dashboardapi')
def dashboardapi():
    if 'username' in session:
        dump = Deck_Scores.query.filter_by(username=session['username']).order_by(Deck_Scores.deck_master_name,Deck_Scores.deck_name).all()
        deck_score_list = []
        overall_score = 0
        overall_score_sum = 0
        overall_score_count = 0
        for i in dump:
            if i.score is not None:
                deck_score_list.append(i)
                overall_score_sum += i.score
                overall_score_count += 1
        if overall_score_count != 0:
            overall_score = round(overall_score_sum / overall_score_count, 2)
            scoredata = []
            for i in deck_score_list:
                tempobj = {}
                tempobj["overallscore"] = overall_score
                tempobj["deck_master_name"] = i.deck_master_name
                tempobj["deck_name"] = i.deck_name
                tempobj["end_time"] = i.end_time
                tempobj["score"] = i.score
                scoredata.append(tempobj)
            return json.dumps(scoredata)
        else:
            return json.dumps("noscoreinfo")
    else:
        return json.dumps("login first")

@app.route('/deck_dashboardapi')
def deck_dashboardapi():
    if 'username' in session:
        dump_cards = Deck_Data.query.order_by(Deck_Data.deck_master_name, Deck_Data.deck_name).all()
        dump_deck = Deck_Data.query.filter(Deck_Data.deck_rating.isnot('None')).all()
        deck_score = {}
        for i in dump_deck:
            try:
                current_rating_total = deck_score[i.deck_master_name][0]
                current_count = deck_score[i.deck_master_name][1]
                new_rating_total = current_rating_total + (i.deck_rating * i.deck_rating_count)
                new_count = current_count + i.deck_rating_count
                new_rating = round(new_rating_total / new_count, 2)
                deck_score[i.deck_master_name] = [new_rating_total, new_count, new_rating]
            except:
                deck_score[i.deck_master_name] = [(i.deck_rating * i.deck_rating_count), i.deck_rating_count,
                                                  ((i.deck_rating * i.deck_rating_count) / i.deck_rating_count)]
        outcome = []
        for i in dump_cards:
            try:
                tempobject = {}
                tempobject["deck_master_name"] = i.deck_master_name
                tempobject["deck_master_rating"] = deck_score[i.deck_master_name][2]
                tempobject["deck_name"] = i.deck_name
                if (i.deck_rating == "None") or (i.deck_rating_count == "None"):
                    tempobject["deck_rating"] = "No ratings available"
                    tempobject["deck_rating_count"] = "No ratings available"
                else:
                    tempobject["deck_rating"] = i.deck_rating
                    tempobject["deck_rating_count"] = i.deck_rating_count
                outcome.append(tempobject)
            except:
                pass
        return json.dumps(outcome)
    else:
        return json.dumps("login first")

@app.route('/deck_managementapi')
def deck_managementapi():
    if 'username' in session:
        if session['username'] == 'Admin':
            dump = Deck_Data.query.order_by(Deck_Data.deck_master_name, Deck_Data.deck_name).all()
            outlist = []
            for i in dump:
                tempobj = {}
                tempobj["deck_master_name"] = i.deck_master_name
                tempobj["deck_name"] = i.deck_name
                tempobj["deck_language"] = i.deck_language
                tempobj["updatepath"] = "/deckmanagement/update/"+ str(i.deck_id)
                tempobj["deletepath"] = "/deckmanagement/delete/" + str(i.deck_id)
                tempobj["deckid"] = i.deck_id
                outlist.append(tempobj)
            return json.dumps(outlist)
        else:
            return json.dumps("noadmin")
    else:
        return json.dumps("login first")

@app.route('/deck_managementapi/delete/<int:deck_id>', methods=["GET", "POST"])
def deck_managementapi_delete(deck_id):
    if 'username' in session:
        if session['username'] == 'Admin':
            if request.method == 'GET':
                deck_name = Deck_Data.query.filter_by(deck_id=deck_id).first().deck_name
                return json.dumps(deck_name)
            if request.method == 'POST':
                deck_name = Deck_Data.query.filter_by(deck_id=deck_id).first().deck_name
                Deck_Data.query.filter_by(deck_id=deck_id).delete()
                Deck_Scores.query.filter_by(deck_name=deck_name).delete()
                db.session.commit()
                return json.dumps("success")
        else:
            return json.dumps("noadmin")
    else:
        return json.dumps("login first")

@app.route('/deck_managementapi/update/<int:deck_id>', methods=["GET", "POST"])
def dec_managementapi_update(deck_id):
    if 'username' in session:
        if session['username'] == 'Admin':
            if request.method == "GET":
                dump = Deck_Data.query.filter_by(deck_id=deck_id).first()
                outobj = {}
                outobj["deck_master_name"] = dump.deck_master_name
                outobj["deck_name"] = dump.deck_name
                outobj["deck_answer"] = dump.deck_answer
                outobj["deck_option_1"] = dump.deck_option_1
                outobj["deck_option_2"] = dump.deck_option_2
                outobj["deck_option_3"] = dump.deck_option_3
                outobj["deck_option_4"] = dump.deck_option_4
                outobj["deck_language"] = dump.deck_language
                return json.dumps(outobj)
            if request.method == "POST":
                content_type = request.headers.get('Content-Type')
                if (content_type == 'application/json'):
                    jsondata = request.json
                    deck_name = jsondata["deck_name"]
                    deck_master_name = jsondata["deck_master_name"]
                    deck_answer = jsondata["deck_answer"]
                    deck_option_1 = jsondata["deck_option_1"]
                    deck_option_2 = jsondata["deck_option_2"]
                    deck_option_3 = jsondata["deck_option_3"]
                    deck_option_4 = jsondata["deck_option_4"]
                    deck_language = jsondata["deck_language"]
                    if (deck_answer == deck_option_1) or (deck_answer == deck_option_2) or (deck_answer == deck_option_3) or (deck_answer == deck_option_4):
                        try:
                            deck_data_details = Deck_Data.query.filter_by(deck_id=deck_id).first()
                            deck_score_details = Deck_Scores.query.filter_by(deck_name=deck_data_details.deck_name).all()
                            for i in deck_score_details:
                                i.deck_name = deck_name
                                i.deck_master_name = deck_master_name
                            deck_data_details.deck_master_name = deck_master_name
                            deck_data_details.deck_name = deck_name
                            deck_data_details.deck_answer = deck_answer
                            deck_data_details.deck_option_1 = deck_option_1
                            deck_data_details.deck_option_2 = deck_option_2
                            deck_data_details.deck_option_3 = deck_option_3
                            deck_data_details.deck_option_4 = deck_option_4
                            deck_data_details.deck_language = deck_language
                            db.session.commit()
                            outobj = {}
                            outobj["status"] = "Success"
                            outobj["deck_id"] = deck_id
                            return json.dumps(outobj)
                        except:
                            outobj = {}
                            outobj["status"] = "Duplicates"
                            outobj["deck_id"] = deck_id
                            return json.dumps(outobj)
                    else:
                        outobj = {}
                        outobj["status"] = "optionserror"
                        outobj["deck_id"] = deck_id
                        return json.dumps(outobj)
        else:
            return json.dumps("noadmin")
    else:
        return json.dumps("login first")

@app.route('/deck_managementapi/create', methods=["GET", "POST"])
def dec_managementapi_create():
    if 'username' in session:
        if session['username'] == 'Admin':
            if request.method == "GET":
                return json.dumps("get_success")
            if request.method == "POST":
                content_type = request.headers.get('Content-Type')
                if (content_type == 'application/json'):
                    jsondata = request.json
                    deck_name = jsondata["deck_name"]
                    deck_master_name = jsondata["deck_master_name"]
                    deck_answer = jsondata["deck_answer"]
                    deck_option_1 = jsondata["deck_option_1"]
                    deck_option_2 = jsondata["deck_option_2"]
                    deck_option_3 = jsondata["deck_option_3"]
                    deck_option_4 = jsondata["deck_option_4"]
                    deck_language = jsondata["deck_language"]
                    if (deck_answer == deck_option_1) or (deck_answer == deck_option_2) or (deck_answer == deck_option_3) or (deck_answer == deck_option_4):
                        try:
                            deckdata = Deck_Data(deck_name=deck_name, deck_master_name=deck_master_name,deck_answer=deck_answer, deck_option_1=deck_option_1,deck_option_2=deck_option_2, deck_option_3=deck_option_3,deck_option_4=deck_option_4, deck_language=deck_language,deck_rating='None', deck_rating_count='None')
                            db.session.add(deckdata)
                            db.session.commit()
                            return json.dumps("Success")
                        except:
                            return json.dumps("Duplicates")
                    else:
                        return json.dumps("optionserror")
        else:
            return json.dumps("noadmin")
    else:
        return json.dumps("login first")

@app.errorhandler(404)
def page_not_found(e):
    # note that we set the 404 status explicitly
    return redirect("/#/page not found", code=404)

# Upload folder
UPLOAD_FOLDER = 'static'
app.config['UPLOAD_FOLDER'] =  UPLOAD_FOLDER


@app.route('/deck_managementapi/createusingcsv', methods=["POST"])
def dec_managementapi_createusingcsv():
    if 'username' in session:
        if session['username'] == 'Admin':
            if request.method == "POST":
                # get the uploaded file
                uploaded_file = request.files['file']
                if uploaded_file.filename != '':
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], uploaded_file.filename)
                    # set the file path
                    uploaded_file.save(file_path)
                # save the file
                filename = "static/" + str(uploaded_file.filename)
                opencsv = open(filename, "r")
                line = opencsv.readline().strip().split(",")
                deck_name = ""
                deck_master_name = ""
                deck_answer = ""
                deck_option_1 = ""
                deck_option_2 = ""
                deck_option_3 = ""
                deck_option_4 = ""
                deck_language = ""
                while line != [""]:
                    if line[0] == "Deck Name:":
                        deck_master_name = line[1]
                    elif line[0] == "Card Name:":
                        deck_name = line[1]
                    elif line[0] == "Deck Answer:":
                        deck_answer = line[1]
                    elif line[0] == "Deck Option 1:":
                        deck_option_1 = line[1]
                    elif line[0] == "Deck Option 2:":
                        deck_option_2 = line[1]
                    elif line[0] == "Deck Option 3:":
                        deck_option_3 = line[1]
                    elif line[0] == "Deck Option 4:":
                        deck_option_4 = line[1]
                    elif line[0] == "Deck Language:":
                        deck_language = line[1]
                    line = opencsv.readline().strip().split(",")
                if (deck_name == "") or (deck_master_name == "") or (deck_answer == "") or (deck_option_1 == "") or (
                        deck_option_2 == "") \
                        or (deck_option_3 == "") or (deck_option_4 == "") or (deck_language == ""):
                    return redirect(url_for('vue'))
                else:
                    if (deck_answer == deck_option_1) or (deck_answer == deck_option_2) or (deck_answer == deck_option_3) or (deck_answer == deck_option_4):
                        try:
                            deckdata = Deck_Data(deck_name=deck_name, deck_master_name=deck_master_name,deck_answer=deck_answer, deck_option_1=deck_option_1,deck_option_2=deck_option_2, deck_option_3=deck_option_3,deck_option_4=deck_option_4, deck_language=deck_language,deck_rating='None', deck_rating_count='None')
                            db.session.add(deckdata)
                            db.session.commit()
                            return redirect(url_for('vue'))
                        except:
                            return redirect(url_for('vue'))
                    else:
                        return redirect(url_for('vue'))
        else:
            return redirect(url_for('vue'))
    else:
        return redirect(url_for('vue'))


@app.route('/deckmanagement/export//<int:deck_id>',)
def dec_managementapi_export(deck_id):
    if 'username' in session:
        if session['username'] == 'Admin':
            dump = Deck_Data.query.filter_by(deck_id=deck_id).first()
            output = ""
            output = output + "Deck Name:"+"," + dump.deck_master_name + ",\n"
            output = output + "Card Name:"+"," + dump.deck_name + ",\n"
            output = output + "Deck Answer:" + "," + dump.deck_answer + ",\n"
            output = output + "Deck Option 1:" + "," + dump.deck_option_1 + ",\n"
            output = output + "Deck Option 2:" + "," + dump.deck_option_2 + ",\n"
            output = output + "Deck Option 3:" + "," + dump.deck_option_3 + ",\n"
            output = output + "Deck Option 4:" + "," + dump.deck_option_4 + ",\n"
            output = output + "Deck Language:" + "," + dump.deck_language + ",\n"
            response = make_response(output)
            response.headers["Content-Disposition"] = "attachment; filename="+str(dump.deck_name)+".csv"
            return response, 200
        else:
            return json.dumps("noadmin")
    else:
        return json.dumps("login first")


@app.route('/dailyreminder')
def dailyreminder():
    if 'username' in session:
        if session['username'] == 'Admin':
            dump = Users.query.order_by(Users.username).all()
            today = date.today()
            dtstr = str(today)
            for i in dump:
                d1str = i.lastemail
                d1 = date(int(d1str[0:4]), int(d1str[5:7]), int(d1str[8:]))
                d2 = date(int(dtstr[0:4]), int(dtstr[5:7]), int(dtstr[8:]))
                delta = d2 - d1
                delta = str(delta.days)
                delta = int(delta)
                if delta > 0:
                    emailsend = True
                    scoresdump = Deck_Scores.query.filter_by(username=i.username).with_entities(Deck_Scores.start_time).distinct().all()
                    for j in scoresdump:
                        if str(date.today().strftime("%d/%m/%y")) == j.start_time[0:8]:
                            emailsend = False
                    if emailsend:
                        print(i.username)
                        userinfodump = Users.query.filter_by(username=i.username).first()
                        userinfodump.lastemail = dtstr
                        db.session.commit()
                        SendEmail(i.username,i.email)
            return json.dumps('completed')
        else:
            return json.dumps("noadmin")
    else:
        return json.dumps("login first")
