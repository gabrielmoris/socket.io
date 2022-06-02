import "./App.css";
import { useState } from "react";

function App() {
    const [name, setName] = useState();
    const [error, setError] = useState();
    const [nameSumbmited, setNameSubmited] = useState();

    const submitForm = (e) => {
        e.preventDefault();
        console.log("YOU SEND THIS", name);
        fetch("http://localhost:3001/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(name),
        })
            .then((data) => data.json())
            .then((data) => {
                if (data.success === true) {
                    setNameSubmited(data.response);
                } else {
                    setError("Something went wrong.");
                }
            })
            .catch((err) => {
                console.log("Err in fetch /register.json", err);
                setError("Something went wrong.");
            });
    };

    const handleChange = (e) => {
        setName({ [e.target.name]: e.target.value });
    };

    const checkuser = (e) => {
        e.preventDefault();
        fetch("http://localhost:3001/users", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((data) => {
                return data.json();
            })
            .then((data) => {
                console.log(data.response);
            })
            .catch((err) => {
                console.log("Err in fetch /register.json", err);
                setError("Something went wrong.");
            });
    };

    return (
        <div className="App">
            <h1>SOCKET.IO CHAT</h1>
            {!nameSumbmited && (
                <form onSubmit={submitForm}>
                    <input type="text" name="name" onChange={handleChange} />

                    <button>Send your name</button>
                </form>
            )}
            {nameSumbmited && (
                <p className="name-hello">Hello, {nameSumbmited}!!</p>
            )}
            {error && <span style={{ color: "red" }}>{error}</span>}
            <button onClick={checkuser}>click to check your cookie user</button>
        </div>
    );
}

export default App;
