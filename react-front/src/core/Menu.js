import React from 'react'
import {Link, withRouter} from 'react-router-dom'
import {signout, isAuthenticated} from "../auth"
// import "../styles/menu.css"
const isActive = (history, path) => {
	if(history.location.pathname === path) 
		return {color: "#ff9900"}
			else return {color: "#ffffff"}
}

const Menu = ({history}) => (
	<div>
		<nav className="nav nav-tabs" style = {{ backgroundColor: "#000000"}}>
		
			{!isAuthenticated() && (
				<>
				<ul className="nav nav-tabs ml-auto">
					<li className="nav-item">
						<Link className="nav-link" style={isActive(history,"/signin")} to="/signin">Sign In</Link>
					</li>
					<li className="nav-item float-left" >
						<Link className="nav-link" style={isActive(history,"/signup")} to="/signup">Sign Up</Link>
					</li>
				</ul>
				</>
			)}

			{isAuthenticated() && (
				<>
					<li className="nav-item">
						<Link to = {`/user/${isAuthenticated().user._id}`}
						  style={
						  			isActive(history,
						  			`/user/${isAuthenticated().user._id}`
							  		)
						  		} 
						  className = "nav-link">
							{`${isAuthenticated().user.name}'s profile`} 
						</Link>
					</li>
				<ul className="nav nav-tabs ml-auto">
					<li className="nav-item">
						<span 
							className="nav-link" 
							style={isActive(history,"/signup"), {cursor: "pointer", color: "#ffffff"}} 
							onClick={() => signout(() => history.push('/'))}
							to="/signout">Sign Out</span>
						{/* in signout we use a tag instead of link tag because we are not linking two different components */}
					</li>
				</ul>
				</>
			)}
		</nav>
	</div>
)

export default withRouter(Menu);

