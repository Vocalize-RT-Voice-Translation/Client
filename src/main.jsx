import React from 'react';
import ReactDOM from 'react-dom/client';
import {
	BrowserRouter,
	Route,
	Routes,
} from 'react-router-dom';
import './Styles/globals.scss';
import { Toaster } from 'react-hot-toast';
// Page Imports
import Home from './Pages/Home.jsx';
import Layout from './Pages/Layout.jsx';
import About from './Pages/About.jsx';
import Technology from './Pages/Technology.jsx';
import Developers from './Pages/Developers.jsx';
import Translate from './Pages/Translate.jsx';
import Meeting from './Pages/Meeting.jsx';
import Test from './Pages/Test.jsx';
import NewMeeting from './Pages/NewMeeting.jsx';

ReactDOM.createRoot(
	document.getElementById('root')
).render(
	<>
		<Toaster />
		<BrowserRouter>
			<Layout>
				<Routes>
					<Route
						path='/'
						element={<Home />}
					/>
					<Route
						path='/translate'
						element={<Translate />}
					/>
					<Route
						path='/about'
						element={<About />}
					/>
					<Route
						path='/technology'
						element={<Technology />}
					/>
					<Route
						path='/developers'
						element={<Developers />}
					/>
					<Route
						path='/meeting/:id'
						element={<Meeting />}
					/>
					<Route
						path='/meeting'
						element={<NewMeeting />}
					/>
					<Route
						path='/test'
						element={<Test />}
					/>
				</Routes>
			</Layout>
		</BrowserRouter>
	</>
);
