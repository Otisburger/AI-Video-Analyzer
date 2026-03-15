import {useEffect, useState} from 'react';
import axios from "axios";
import {useNavigate} from 'react-router-dom';
import './conversation.css';

const baseUrl = process.env.REACT_APP_BASEURL

export function Conversation(){

	const [inputValue, setInputValue] = useState('');

	const [history, setHistory] = useState([]);

	const [disabled, setDisabled] = useState(false);

    const navigate = useNavigate();

	const handleChange = (event) => {
		setInputValue(event.target.value);
	};

    const handleRedirect = () => {
		navigate('/input');
	};

	const handleSubmit = async (event) => {
        event.preventDefault();
		setDisabled(true)
        const formData = { question: inputValue };
        try {
			setHistory(prev => [...prev, inputValue]);
			const response = await axios.post(baseUrl+'/conversation', formData, { withCredentials: true });
			if(response.data['status'] === 'error'){
				alert(response.data['message']);
			}
			else{
				setHistory(prev => [...prev, response.data.result]);
			}
		}
		catch (error) {
        	console.error('Error:', error);
		}
		setDisabled(false)
    };

	return (
    <div className="App">
		    <h1>AI Video Analyzer</h1>
				{history.map((response, index) => (
    				<div
        				key={index}
        				id={index}
        				className={index % 2 === 0 ? "userText-conversation" : "aiText-conversation"}
    				>
        			{response}
    				</div>
				))}
		    	<div className = "main-conversation">
			    	<form onSubmit={handleSubmit}>
					    <textarea
                      		type="text"
                      		name="question"
                      		id="question"
							onChange={handleChange}
							placeholder="Type your question here."
                    	/>
				        <input
							id = "button"
							type="submit"
							name="submit"
							value="Submit"
							className="submit"
							disabled={disabled}
						/>
						<button type="button" onClick={handleRedirect} className="submit">
							Back to Home
						</button>
			    	</form>
		    	</div>
    </div>
	);
}