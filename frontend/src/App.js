import './input.css';
import './conversation.css';
import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom'
import { Input } from './input'
import { Conversation } from './conversation'

function App() {
	return(
		<div>
			<BrowserRouter>
				<Routes>
					<Route index element={<Input/>}/>
					<Route path="/input" element={<Input/>}/>
					<Route path="/conversation" element={<Conversation/>}/>
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
