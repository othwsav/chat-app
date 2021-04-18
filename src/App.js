import React, {useState} from 'react';
import './css/App.css'

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

firebase.initializeApp({
	apiKey: "AIzaSyDr0GY1NXpoF_lntuj9zTTLGjCC6gIjtCQ",
    authDomain: "first-chat-app-a3d37.firebaseapp.com",
    projectId: "first-chat-app-a3d37",
    storageBucket: "first-chat-app-a3d37.appspot.com",
    messagingSenderId: "468103673202",
    appId: "1:468103673202:web:956133ab56f259e59b59eb"
})

const auth = firebase.auth();
const firestore = firebase.firestore();


const scrollToElem = (e) => {e.scrollTop = e.scrollHeight};


function App() {

	const [user] = useAuthState(auth)

	
	const [theme, setTheme] = useState('');

	return (
		<div className={`body ${theme}`}>
			<div className="App">
				<section>
					<Theme theme={theme} setTheme={setTheme} />
					{user ? <ChatRoom /> : <SignIn/>}
				</section>
			</div>
		</div>
	);
}

function SignIn(props) {
    
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    }
    
    return(
        <div className="sign_in">
            <button onClick={signInWithGoogle}>Sign in with google</button>
        </div>
    )
}

function SignOut() {
	return auth.currentUser && (
		<div className="sign_out">
            <button onClick={() => auth.signOut()}>Sign Out</button>
        </div>
	)
}

function Theme(props){

	let {theme, setTheme} = props;
	

	return(
		<button onClick={() => {
			setTheme((theme === '')? "dark" : "")

		}}>{(theme === '')? "Dark Theme" : "Light Theme"}</button>
	)

}


function ChatRoom() {

	// const bottom = useRef()

	const messagesRef = firestore.collection('messages');
	const query = messagesRef.orderBy('createdAt');//.limitToLast(50)//.limit(25);
	
	const [messages] = useCollectionData(query, {idField: 'id'});

	const [formVal, setFormVal] = useState('');

	const sendMessage = async(e) => {


		e.preventDefault();

		const {uid, photoURL} = auth.currentUser;


		await messagesRef.add({
			text: formVal,
			createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			uid,
			photoURL
		});

		
		setFormVal('');
		
		let scrollingElement = document.querySelector("main");
		await scrollToElem(scrollingElement);
	}

	return (
		<>
			<SignOut />
			<main>
				{messages && messages.map(msg => (<ChatMessage key={msg.id} message={msg}/>))}
			
				<div></div>
			
			</main>

			<form onSubmit={sendMessage}>

				<input value={formVal} onChange={(e) => setFormVal(e.target.value)} placeholder="Write somthing..." />

				<button type="submit">Send</button>

			</form>
		</>
	)

}

function ChatMessage(props) {

	const {text, createdAt, uid, photoURL} = props.message;
	
	const messageClass = (uid === auth.currentUser.uid)? 'sent' : 'received';


	return (
		<div className={`whole_msg ${messageClass}`}>
			<div className="image">
				<img src={photoURL} alt="othwsav first chat app" />
			</div>
			<div className="msg">
				<span>{text}</span>
				<span>{createdAt? createdAt.toDate().toDateString() : ''}</span>
				<span>{createdAt? createdAt.toDate().toLocaleTimeString('ar-MA') : ''}</span>
			</div>
		</div>
	)
}

export default App;
