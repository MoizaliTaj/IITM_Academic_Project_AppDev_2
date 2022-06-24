const store = new Vuex.Store({
    state: {
      grand_total: 0,
      username: null,
    },
})
    
const Home = Vue.component('home', {
    template: `
    <div>
        <h3> Welcome to Flash Card Application </h3>
        <p>This application provides various quizes that helps you improve your knowledge.</p>
        <p><To start practising simply click on 'Review' and you can practise on different Decks.</p>
        <p>You will be given a score on how well you perform. You can view your progress by clicking on 'User Dashboard'.</p>
        <p>At the end of each flash card you will be asked to rate. This ratings will help other users.</p>
    </div>
    `,
})

const Navbar = Vue.component('navbar', {
    template:`
    <nav id="navbar" class="navbar navbar-expand-lg navbar-dark bg-black">
        <a class="navbar-brand" href="#">Flash Card</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <div v-if="username == null">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item"><router-link class="nav-link" to="/review">Review</router-link></li>
                    <li class="nav-item"><router-link class="nav-link" to="/dashboard">User Dashboard</router-link></li>
                    <li class="nav-item"><router-link class="nav-link" to="/deckdashboard">Deck Dashboard</router-link></li>
                    <li  class="nav-item"><router-link class="nav-link" to="/login">Login</router-link></li>
                </ul>
            </div>
            <div v-else>
                <div v-if="username == 'Admin'">
                    <ul class="navbar-nav mr-auto">
                        <li class="nav-item"><router-link class="nav-link" to="/review">Review</router-link></li>
                        <li class="nav-item"><router-link class="nav-link" to="/dashboard">User Dashboard</router-link></li>
                        <li class="nav-item"><router-link class="nav-link" to="/deckdashboard">Deck Dashboard</router-link></li>
                        <li class="nav-item"><router-link class="nav-link" to="/deckmanagement">Deck Management</router-link></li>
                        <li class="nav-item"><router-link class="nav-link" to="/reporting">Reporting</router-link></li>
                        <li class="nav-item nav-link">Loged in as <span class="user">{{username}}</span></li>
                        <li class="nav-item"><router-link class="nav-link" to="/logout">Logout</router-link></li>
                    </ul>
                 </div>
                <div v-else>
                    <ul class="navbar-nav mr-auto">
                        <li class="nav-item"><router-link class="nav-link" to="/review">Review</router-link></li>
                        <li class="nav-item"><router-link class="nav-link" to="/dashboard">User Dashboard</router-link></li>
                        <li class="nav-item"><router-link class="nav-link" to="/deckdashboard">Deck Dashboard</router-link></li>
                        <li class="nav-item nav-link">Loged in as <span class="user">{{username}}</span></li>
                        <li class="nav-item"><router-link class="nav-link" to="/logout">Logout</router-link></li>
                    </ul>
                </div>
            </div>
        </div>
    </nav>`,
    computed: {
        username () {
            return store.state.username;
        }
      }
})

const Foot = Vue.component('foot',{
    template:`
        <footer class="text-center text-lg-start bg-light text-muted footercustom">
            <div class="text-center p-1" style="background-color: rgba(0, 0, 0, 0.05);color: #052465;">
            App Development 2 - Project - Created by Moizali Taj, Roll # 21f1003906.
            </div>
        </footer>
    `
})

const Login = Vue.component('login', {
    template: `
    <div>
    <h3> Login </h3>
    {{secret_message}}
    <div class="form-group">
        <label for="username">Username</label>
        <input type="text" id="username" v-model="username" /> 
    </div>
    <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" /> 
    </div>
    <button v-on:click="loginstart">Login</button>
    </div>
    `,
    data: function() {
        return {
            username: null,
            password: null,
            secret_message: null,
        }
    },
    methods: {
        loginstart: function() {
            fetch('/loginapi', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "username": this.username,
                        "password": this.password,
                    }),
                })
            .then(response => response.json())
            .then(data => {
                let d = data;
                if (d == "success"){
                    store.state.username = this.username,
                    router.push("/")
                } else if (d == "failure"){
                    this.secret_message = "Incorrect username or password. Check the details and try again."
                }else {
                    this.secret_message = "Unknown error"
                }
            })
        }
    },
})

const Logout = Vue.component('logout', {
    template: `
    <div>
        <p>logout succesfull</p>
    </div>
    `,
    data: function() {
        return {
        }
    },
    mounted: async function() {
        r = await fetch("/logoutapi");
        d = await r.json();
        store.state.username = null;
    },
})

const Review = Vue.component('review', {
    template: `
    <div>
      <h3> Review </h3>
      <p>Select a  deck to proceed</p>
        <ul>
            <li v-for="deck in decks"><router-link :key="deck.name" :to="{ path: deck.path }">{{deck.name}}</router-link></li>
        </ul>
    </div>
    `,
    data: function() {
        return {
            decks: [],
        }
    },
    mounted: async function() {
        r = await fetch("/reviewapi")
        d = await r.json()
        if (d != "login first"){
            this.decks = (d);
        }else {
            router.push("/login")
        }

    }
})

const Questions = Vue.component('questions', {
    template: `
    <div>
        <br>
      <div v-if="deck_name_for_question != null">
        <div v-if="outcome == null" >
            <p>Select the correct answer for {{deck_name_for_question}}</p>
            <input type="radio" name="answer" :value="deck_option_1" ><label>{{deck_option_1}}</label><br><br>
            <input type="radio" name="answer" :value="deck_option_2" ><label>{{deck_option_2}}</label><br><br>
            <input type="radio" name="answer" :value="deck_option_3" ><label>{{deck_option_3}}</label><br><br>
            <input type="radio" name="answer" :value="deck_option_4" ><label>{{deck_option_4}}</label><br><br>
            <p v-if="user_error != null">{{user_error}}</p>
            <button v-on:click="questionsubmision">Submit</button><br><br>
        </div>
        <div v-if="outcome != null">
            <p>{{outcome}}</p>
        </div>
      </div>
    </div>
    `,
    data: function() {
        return {
            url_data: "",
            deck_name_for_question: null,
            deck_option_1: null,
            deck_option_2: null,
            deck_option_3: null,
            deck_option_4: null,
            fld_id: null,
            rating: null,
            rating_count: null,
            user_answer: null,
            user_error: null,
            outcome: null,
            rating: null,
            rating_error: null,
            usersrating:null,
            deckid:null,
            ratingoutcome: null,
        }
    },
    mounted: async function() {
        this.url_data = this.$route.params.id;
        r = await fetch("/getquestionapi/"+this.url_data)
        d = await r.json()
        if (d != "login first"){
            this.deck_name_for_question = d.deck_name_for_question;
            this.deck_option_1 = d.deck_option_1;
            this.deck_option_2 = d.deck_option_2;
            this.deck_option_3 = d.deck_option_3;
            this.deck_option_4 = d.deck_option_4;
            this.fld_id = d.fld_id;
            this.rating = d.rating;
            this.rating_count = d.rating_count;
        }else {
            router.push("/login")
        }
    },
    methods: {
        questionsubmision: function() {
            try {
                let answer = document.querySelector('input[name="answer"]:checked').value;
                this.user_answer = answer;
                fetch('/submitanswer/'+this.fld_id, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "answer": this.user_answer,
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    let d = data;
                    if (d.status == "success"){
                        this.outcome = "Good job! This is the correct answer.";
                        setTimeout(
                            function() {
                                router.push("/ratings/"+d.deck_id)
                            }, 4000);
                    } else {
                        this.outcome = "Sorry, your answer is incorrect. Correct answer is " + d.status
                        setTimeout(
                            function() {
                                router.push("/ratings/"+d.deck_id)
                            }, 4000);
                    }
                })
            }
            catch(err) {
                this.user_error = "Select a answer";
            }
        },
    },
})

const Ratings = Vue.component('ratings', {
    template: `
    <div>
        <div v-if="ratingoutcome == null">
            <p>{{outcome}}</p>
            <p>Provide a rating for the last question.</p>
            <input type="radio" name="rating" value="1" ><label>1</label><br>
            <input type="radio" name="rating" value="2" ><label>2</label><br>
            <input type="radio" name="rating" value="3" ><label>3</label><br>
            <input type="radio" name="rating" value="4" ><label>4</label><br>
            <input type="radio" name="rating" value="5" ><label>5</label><br>
            <p v-if="rating_error != null">{{rating_error}}</p>
            <button v-on:click="ratingsubmision">Submit</button><br><br>
        </div>
        <div v-if="ratingoutcome != null">
            <p>{{ratingoutcome}}</p>
        </div>
    </div>
    `,
    data: function() {
        return {
            deckid:null,
            usersrating:null,
            ratingoutcome: null,
            rating_error: null,
        }
    },
    mounted: async function() {
        this.deckid = this.$route.params.id;
    },
    methods: {
        ratingsubmision: function() {
            try {
                let rating = document.querySelector('input[name="rating"]:checked').value;
                this.usersrating = rating;
                fetch('/ratingapi/'+this.deckid, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "rating": this.usersrating,
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    let d = data;
                    if (d == "success"){
                        this.ratingoutcome = "Thanks for providing the rating";
                        setTimeout(
                            function() {
                                router.push("/review")
                            }, 4000);
                    } else {
                        this.ratingoutcome = "Some error occured."
                        setTimeout(
                            function() {
                                router.push("/review")
                            }, 4000);
                    }
                })
            }
              catch(err) {
                this.rating_error = "Select a rating";
            }
        }
    },
})

const Dashboard = Vue.component('dashboard', {
    template: `
    <div>
        <div v-if="project == null">
            <p>Overall Score is {{overallscore}}</p>
            <table>
                <tr><th>Deck Name</th><th>Card Name</th><th>Last reviewed</th><th>Score</th></tr>
                <tr v-for="score in scoredata"><td>{{score.deck_master_name}}</td><td>{{score.deck_name}}</td><td>{{score.end_time}}</td><td>{{score.score}}</td></tr>
            </table>
        </div>
        <div v-else>
            <p>No score data exists for the current user.</p>
        </div>
    </div>
    `,
    data: function() {
        return {
            scoredata: [],
            project: null,
            overallscore: null,
        }
    },
    mounted: async function() {
        r = await fetch("/dashboardapi")
        d = await r.json()
        if (d == "noscoreinfo"){
            this.project = d;
        }
        else if (d != "login first"){
            this.scoredata = d;
            this.overallscore = d[0].overallscore;
        }else {
            router.push("/login")
        }
    },
})

const DeckDashboard = Vue.component('deckdashboard', {
    template: `
    <div>
        <br>
        <table>
            <tr><th>Deck Name</th><th>Deck Rating</th></tr>
            <tr v-for="deck in deckoverall"><td>{{deck.deckname}}</td><td>{{deck.deckrating}}</td></tr>
        </table>
        <br>
        <hr>
        <table>
        <tr><th>Deck Name</th><th>Card Name</th><th>Card Rating</th><th>Number of Ratings</th></tr>
        <tr v-for="deck1 in fullresult"><td>{{deck1.deck_master_name}}</td><td>{{deck1.deck_name}}</td><td>{{deck1.deck_rating}}</td><td>{{deck1.deck_rating_count}}</td></tr>
        </table>
        <br>
    </div>
    `,
    data: function() {
        return {
            deckoverall: null,
            fullresult: null,
        }
    },
    mounted: async function() {
        r = await fetch("/deck_dashboardapi")
        d = await r.json()
        if (d != "login first"){
            this.fullresult = d;
            deckoveralllist = [];
            for (let i = 0; i < d.length; i++ ) {
                try {
                    deckoveralllist[d[i].deck_master_name] = d[i].deck_master_rating;
                  }
                  catch(err) {

                  }
              }
              outcomelist = []
              Object.keys(deckoveralllist).forEach(element => {
                  tempobj = {}
                  tempobj["deckname"] = element;
                  tempobj["deckrating"] = deckoveralllist[element];
                  outcomelist.push(tempobj)
              });
              this.deckoverall = outcomelist;

        }else {
            router.push("/login")
        }
    },
})

const DeckManagement = Vue.component('deckmanagement', {
    template: `
    <div>
    <br>
        <div v-if="flag == null">
            <h4><router-link class="nav-link" to="/deckmanagement/create">Add New Deck</router-link></h4>
            <br>
            <table>
                <tr><th>Deck Name</th><th>Card Name</th><th>Deck Language</th><th colspan="2">Actions</th></tr>
                <tr v-for="data in data_list"><td>{{data.deck_master_name}}</td><td>{{data.deck_name}}</td><td>{{data.deck_language}}</td><td><router-link :key="data.deck_name" :to="{ path: data.updatepath }">Update</router-link></td><td><router-link :key="data.deck_name" :to="{ path: data.deletepath }">delete</router-link></td></tr>
            </table>
        </div>
        <div v-if="flag == 'notaadmin'">
            Error: Only Administrator has access to this page.
        </div>
    </div>
    `,
    data: function() {
        return {
            data_list:null,
            flag: null,
            deletedeckname:null,
            deletedeckid:null,
        }
    },
    mounted: async function() {
        r = await fetch("/deck_managementapi")
        d = await r.json()
        if (d == "noadmin"){
            this.flag = "notaadmin";
        }
        else if (d == "login first"){
            router.push("/login")
        }
        else {
            this.data_list = d;
        }
    },
})

const DeckDelete = Vue.component('deckdelete', {
    template: `
    <div>
    <br>
        <div v-if="flag == null">
            <p>Are you sure you want to delete {{deckname}}</p>
            <button v-on:click="dele">Yes</button>
            <button v-on:click="dontdelete">No</button>
            <br><br>
        </div>
        <div v-if="flag == 'notaadmin'">
            Error: Only Administrator has access to this page.
        </div>
    </div>
    `,
    data: function() {
        return {
            deckid:null,
            deckname:null,
            flag: null,
        }
    },
    methods: {
        dontdelete: function() {
            router.push("/deckmanagement")
        },
        dele: function() {
            fetch('/deck_managementapi/delete/'+this.deckid, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "data": 0,
                }),
            })
        .then(response => response.json())
        .then(data => {
            let d = data;
            if (d == "noadmin"){
                this.flag = "notaadmin";
            }
            else if (d == "login first"){
                router.push("/login")
            }
            else {
                router.push("/deckmanagement")
            }
        })
        },
    },
    mounted: async function() {
        this.deckid = this.$route.params.id;
        r = await fetch("/deck_managementapi/delete/"+this.deckid)
        d = await r.json()
        if (d == "noadmin"){
            this.flag = "notaadmin";
        }
        else if (d == "login first"){
            router.push("/login")
        }
        else {
            this.deckname = d;
        }
    },
})

const DeckUpdate = Vue.component('deckupdate', {
    template: `
    <div>
    <br>
        <div v-if="flag == null">
        <table>
            <tr><td>Deck Name:</td><td><input type="text" id="deck_master_name" v-model="deck_master_name" /></td></tr>
            <tr><td>Card Name:</td><td><input type="text" id="deck_name" v-model="deck_name" /></td></tr>
            <tr><td>Deck Answer:</td><td><input type="text" id="deck_answer" v-model="deck_answer" /></td></tr>
            <tr><td>Deck Option 1:</td><td><input type="text" id="deck_option_1" v-model="deck_option_1" /></td></tr>
            <tr><td>Deck Option 2:</td><td><input type="text" id="deck_option_2" v-model="deck_option_2" /></td></tr>
            <tr><td>Deck Option 3:</td><td><input type="text" id="deck_option_3" v-model="deck_option_3" /></td></tr>
            <tr><td>Deck Option 4:</td><td><input type="text" id="deck_option_4" v-model="deck_option_4" /></td></tr>
            <tr><td>Deck Language:</td><td>
                <select name="deck_language" v-model="deck_language" >
                    <option :value="deck_language">{{deck_language}}</option>
                    <option value="Ao">Ao</option>
                    <option value="Assamese">Assamese</option>
                    <option value="Bangla">Bangla</option>
                    <option value="Bhili">Bhili</option>
                    <option value="Bhotia">Bhotia</option>
                    <option value="Boro">Boro</option>
                    <option value="English">English</option>
                    <option value="Garo">Garo</option>
                    <option value="Gondi">Gondi</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Khasi">Khasi</option>
                    <option value="Kinnauri">Kinnauri</option>
                    <option value="Konkani">Konkani</option>
                    <option value="Konyak">Konyak</option>
                    <option value="Lakher">Lakher</option>
                    <option value="Lepcha">Lepcha</option>
                    <option value="Lushai">Lushai</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Manipuri">Manipuri</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Nepali">Nepali</option>
                    <option value="Nissi">Nissi</option>
                    <option value="Oriya">Oriya</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="Santali">Santali</option>
                    <option value="Sema">Sema</option>
                    <option value="Sindhi">Sindhi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Tangkhul">Tangkhul</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Thadou">Thadou</option>
                    <option value="Tripuri">Tripuri</option>
                    <option value="Urdu">Urdu</option>
                </select>
            </td></tr>
        </table>
        <button v-on:click="updatesubmit">Submit</button><br><br>
        <a :href="'/deckmanagement/export/' + deckidd" target="_none">Export this deck details as csv.</a>
        </div>
        <div v-if="flag == 'notaadmin'">
            Error: Only Administrator has access to this page.
        </div>
        <div v-if="flag == 'Success'">
            Changes updated successfully.
        </div>
        <div v-if="flag == 'Duplicate'">
            Card name entered was duplicate. Card name must be unique. Try again.
        </div>
        <div v-if="flag == 'optionanswer'">
            Error: options did not contain the answer. One of the option and answer needs to match. Try again.
        </div>
    </div>
    `,
    data: function() {
        return {
            deckidd:null,
            flag: null,
            flagmessage:null,
            deck_master_name: null,
            deck_name: null,
            deck_answer: null,
            deck_option_1: null,
            deck_option_2: null,
            deck_option_3: null,
            deck_option_4: null,
            deck_language:null,
        }
    },
    mounted: async function() {
        this.deckidd = this.$route.params.id;
        r = await fetch("/deck_managementapi/update/"+this.deckidd)
        d = await r.json()
        if (d == "noadmin"){
            this.flag = "notaadmin";
        }
        else if (d == "login first"){
            router.push("/login")
        }
        else {
            this.deck_master_name = d.deck_master_name;
            this.deck_name = d.deck_name;
            this.deck_answer = d.deck_answer;
            this.deck_option_1 = d.deck_option_1;
            this.deck_option_2 = d.deck_option_2;
            this.deck_option_3 = d.deck_option_3;
            this.deck_option_4 = d.deck_option_4;
            this.deck_language = d.deck_language;
        }
    },
    methods: {
        updatesubmit: function() {
            fetch('/deck_managementapi/update/'+this.deckidd, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "deck_name":this.deck_name,
                    "deck_master_name":this.deck_master_name,
                    "deck_answer":this.deck_answer,
                    "deck_option_1":this.deck_option_1,
                    "deck_option_2":this.deck_option_2,
                    "deck_option_3":this.deck_option_3,
                    "deck_option_4":this.deck_option_4,
                    "deck_language":this.deck_language,
                }),
            })
            .then(response => response.json())
            .then(data => {
                let d = data;
                if (d.status == "optionserror"){
                    this.flag = "optionanswer";
                    setTimeout(
                        function() {
                            router.push("/deckmanagement")
                        }, 4000);
                    setTimeout(
                        function() {
                            router.push("/deckmanagement/update/"+d.deck_id)
                        }, 4000);
                }
                else if (d.status == "Duplicates"){
                    this.flag = "Duplicate";
                    setTimeout(
                        function() {
                            router.push("/deckmanagement")
                        }, 4000);
                    setTimeout(
                        function() {
                            router.push("/deckmanagement/update/"+d.deck_id)
                        }, 4000);
                }
                else if (d.status == "Success"){
                    this.flag = "Success";
                    setTimeout(
                        function() {
                            router.push("/deckmanagement")
                        }, 4000);
                }
                else if (d == "noadmin"){
                    this.flag = "notaadmin";
                }
                else if (d == "login first"){
                    router.push("/login")
                }
            })
        },
    },
})

const DeckNew = Vue.component('decknew', {
    template: `
    <div>
    <br>
        <div v-if="flag == null">
        <table>
            <tr><td>Deck Name:</td><td><input type="text" id="deck_master_name" v-model="deck_master_name" /></td></tr>
            <tr><td>Card Name:</td><td><input type="text" id="deck_name" v-model="deck_name" /></td></tr>
            <tr><td>Deck Answer:</td><td><input type="text" id="deck_answer" v-model="deck_answer" /></td></tr>
            <tr><td>Deck Option 1:</td><td><input type="text" id="deck_option_1" v-model="deck_option_1" /></td></tr>
            <tr><td>Deck Option 2:</td><td><input type="text" id="deck_option_2" v-model="deck_option_2" /></td></tr>
            <tr><td>Deck Option 3:</td><td><input type="text" id="deck_option_3" v-model="deck_option_3" /></td></tr>
            <tr><td>Deck Option 4:</td><td><input type="text" id="deck_option_4" v-model="deck_option_4" /></td></tr>
            <tr><td>Deck Language:</td><td>
                <select name="deck_language" v-model="deck_language" >
                    <option :value="deck_language">{{deck_language}}</option>
                    <option value="Ao">Ao</option>
                    <option value="Assamese">Assamese</option>
                    <option value="Bangla">Bangla</option>
                    <option value="Bhili">Bhili</option>
                    <option value="Bhotia">Bhotia</option>
                    <option value="Boro">Boro</option>
                    <option value="English">English</option>
                    <option value="Garo">Garo</option>
                    <option value="Gondi">Gondi</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Khasi">Khasi</option>
                    <option value="Kinnauri">Kinnauri</option>
                    <option value="Konkani">Konkani</option>
                    <option value="Konyak">Konyak</option>
                    <option value="Lakher">Lakher</option>
                    <option value="Lepcha">Lepcha</option>
                    <option value="Lushai">Lushai</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Manipuri">Manipuri</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Nepali">Nepali</option>
                    <option value="Nissi">Nissi</option>
                    <option value="Oriya">Oriya</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="Santali">Santali</option>
                    <option value="Sema">Sema</option>
                    <option value="Sindhi">Sindhi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Tangkhul">Tangkhul</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Thadou">Thadou</option>
                    <option value="Tripuri">Tripuri</option>
                    <option value="Urdu">Urdu</option>
                </select>
            </td></tr>
        </table>
        <br>{{errormessage}}<br>
        <button v-on:click="updatecreate">Submit</button>
        </br></br>
        or</br>
        <form method="POST" action="/deck_managementapi/createusingcsv" enctype="multipart/form-data">
            <p><input type="file" name="file"></p>
            <p><input type="submit" value="Submit"></p>
        </form>
        <div v-if="flag == 'notaadmin'">
            Error: Only Administrator has access to this page.
        </div>
        <div v-if="flag == 'Success'">
            Changes updated successfully.
        </div>
    </div>
    </div>
    `,
    data: function() {
        return {
            flag: null,
            errormessage:null,
            deck_master_name: null,
            deck_name: null,
            deck_answer: null,
            deck_option_1: null,
            deck_option_2: null,
            deck_option_3: null,
            deck_option_4: null,
            deck_language:null,
            file: '',
        }
    },
    mounted: async function() {
        r = await fetch("/deck_managementapi/create")
        d = await r.json()
        if (d == "noadmin"){
            this.flag = "notaadmin";
        }
        else if (d == "login first"){
            router.push("/login")
        }
    },
    methods: {
        updatecreate: function() {
            fetch('/deck_managementapi/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "deck_name":this.deck_name,
                    "deck_master_name":this.deck_master_name,
                    "deck_answer":this.deck_answer,
                    "deck_option_1":this.deck_option_1,
                    "deck_option_2":this.deck_option_2,
                    "deck_option_3":this.deck_option_3,
                    "deck_option_4":this.deck_option_4,
                    "deck_language":this.deck_language,
                }),
            })
            .then(response => response.json())
            .then(data => {
                let d = data;
                if (d == "optionserror"){
                    this.errormessage = "Error: options did not contain the answer. One of the option and answer needs to match. Try again.";
                }
                else if (d == "Duplicates"){
                    this.errormessage = "Card name entered was duplicate. Card name must be unique. Try again.";
                }
                else if (d == "Success"){
                    this.flag = "Success";
                    setTimeout(
                        function() {
                            router.push("/deckmanagement")
                        }, 4000);
                }
                else if (d == "noadmin"){
                    this.flag = "notaadmin";
                }
                else if (d == "login first"){
                    router.push("/login")
                }
            })
        }
    },
})


const Reporting = Vue.component('reporting', {
    template: `
    
    <div v-if="username == 'Admin'">
    <br>
        <button v-on:click="daily">Send Daily Reminders</button>
        <br>{{secret_message}}
    </div>
    <div v-else>
    Error: Only Administrator has access to this page.
    </div>

    `,
    data: function() {
        return {
            secret_message: '',
        }
    },
    computed: {
        username () {
            return store.state.username;
        }
      },

    methods: {
        daily: async function() 
        {
            r = await fetch("/dailyreminder")
            d = await r.json()
            if (d == "noadmin"){
                this.secret_message = "Error: only Admin has access to this functionality";
            }
            else if (d == "login first"){
                router.push("/login")
            }
            else if (d == "completed"){
                this.secret_message = "Send Daily reminders task completed";
            }
        }
    },
})



const NotFound = { template: '<p>Page not found</p>' }

const routes = [{
    path: '/',
    component: Home
}, {
    path: '/reviewa/:id?',
    component: Questions
}, {
    path: '/ratings/:id?',
    component: Ratings
}, {
    path: '/review',
    component: Review
}, {
    path: '/dashboard',
    component: Dashboard
}, {
    path: '/deckdashboard',
    component: DeckDashboard
}, {
    path: '/deckmanagement',
    component: DeckManagement
}, {
    path: '/deckmanagement/delete/:id?',
    component: DeckDelete
}, {
    path: '/deckmanagement/update/:id?',
    component: DeckUpdate
}, {
    path: '/deckmanagement/create',
    component: DeckNew
}, {
    path: '/login',
    component: Login
}, {
    path: '/logout',
    component: Logout
}, {
    path: '/reporting',
    component: Reporting
}, {
    path: '/reporting',
    component: Reporting
}, {
    path: "*",
    component: NotFound
}
];

const router = new VueRouter({
  routes // short for `routes: routes`
})

var app = new Vue({
    el: '#app',
    router: router,
    store: store,
    computed :{
        grand_total1: function(){
            console.log(store.getters.get_grand_total)
            return store.getters.get_grand_total;
            //return store.state.grand_total;
        }
    },
    mounted: async function() {
        r = await fetch("/islogedin")
        d = await r.json()
        if (d != "failure#@!#notlogedin"){
            store.state.username = d
        }
    },
})