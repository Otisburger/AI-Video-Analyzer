import {useEffect, useState} from 'react';
import axios from "axios";
import {useNavigate} from 'react-router-dom';
import './input.css';

const baseUrl = process.env.REACT_APP_BASEURL

export function Input(){

	const [inputValue, setInputValue] = useState('');

	const navigate = useNavigate();

	const handleChange = (event) => {
		setInputValue(event.target.value);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
        const formData = { input: inputValue};
        try {
        	const response = await axios.post(baseUrl+'/input', formData, { withCredentials: true });
			if(response.data['status'] === 'error'){
				alert(response.data['message']);
			}
			else{
				navigate('/conversation')
			}
        }
		catch (error) {
        	console.error('Error:', error);
		}
    };

	return (
    <div className="App">
		    <h1>AI Video Analyzer</h1>
		    	<div className = "main">
			    	<form onSubmit={handleSubmit}>
				        <div className="transcription">
					        <label htmlFor="username">Video Transcript</label>
					        <textarea 
                      			type="text"
                      			name="username"
                      			id="username"
								onChange={handleChange}
								placeholder="Enter your video transcript here."
                    		/>
				        </div>
				        <input
							id = "button"
							type="submit"
							name="submit"
							value="Submit"
							className="submit"
						/>
			    	</form>
		    	</div>
    </div>
	);
}