import React, {Component} from 'react';
import { isAuthenticated } from '../auth'
import { read,update, updateUser } from './userAPI'
import { Redirect } from 'react-router-dom'
import DefaultProfile from "../images/avatar.png"
import imageCompression from 'browser-image-compression'

class EditProfile extends Component {

	constructor() {
		super()
		this.state = {
			id:"",
			name:"",
			email:"",
			password:"",
			redirectToProfile: false,
			error: "",
			fileSize: 0,
			loading: false,
			about: ""
		}
	}
	init = userId => {
		const token = isAuthenticated().token
		read(userId, token)
		.then(data => {
			if(data.error) {
				this.setState({ redirectToProfile: true })
			} else
				this.setState({
					id: data._id, 
					name: data.name, 
					email: data.email,
					error:'',
					about: data.about
				});
		})
	}

	componentDidMount() {
		this.userData = new FormData()
		const userId = this.props.match.params.userId
		this.init(userId);
	}

	isValid = () => {
		const { name, email, password, fileSize } = this.state
		if(fileSize > 100000){
			this.setState({error:"File Size should be less than 100kb"});
				return false
		}
		if(name.length === 0) {
			this.setState({error: "Name is required", loading: false})
			return false
		}
		// email@domain.com
		if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      		this.setState({
        			error: "A valid Email is required",
        			loading: false
      		});
      		return false
    	}
   		if (password.length >= 1 && password.length <= 5) {
		    this.setState({
		        error: "Password must be at least 6 characters long",
		        loading: false
		    });
			return false
		
		}
		return true;
	}

	handleImageUpload = name => event => {
	    var imageFile = event.target.files[0];
	    console.log('originalFile instanceof Blob', imageFile instanceof Blob); // true
	    console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`);
	    const test = (compressedFile) => { 
	        this.userData.set(name, compressedFile)
	        console.log("ok")
	        this.setState({ [name]: compressedFile})
	    }
	    var options = {
	        maxSizeMB: 1,
	        maxWidthOrHeight: 1920,
	        useWebWorker: true
	    }
	    imageCompression(imageFile, options)
	    .then(function (compressedFile) {
	        console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
	        console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB
	   
	        // write your own logic
	        test(compressedFile)
	    })
	    .catch(function (error) {
	      console.log(error.message);
	    });
	}


	handleChange = name => event => {
		// const value = name === 'photo' ? event.target.files[0] :event.target.value
		// const fileSize = name === 'photo' ? event.target.files[0].size : 0;
		const value = event.target.value
		this.userData.set(name, value)
		this.setState ({[name]: value})
	};


	handleNewLine = name => event => {
		// const value = name === 'photo' ? event.target.files[0] :event.target.value
		// const fileSize = name === 'photo' ? event.target.files[0].size : 0;
		var value = event.target.value
		this.userData.set(name, value)
		this.setState ({[name]: value})
	};

	clickSubmit = event => {
	    event.preventDefault();
	    this.setState({ loading: true });
	 
	    if (this.isValid()) {
	        const userId = this.props.match.params.userId;
	        const token = isAuthenticated().token;
	 
	        update(userId, token, this.userData).then(data => {
	            if (data.error) {
	                this.setState({ error: data.error });
	                // if admin only redirect
	            } else if (isAuthenticated().user.role === "admin") {
	                this.setState({
	                    redirectToProfile: true
	                });
	            } else {
	                // if same user update localstorage and redirect
	                updateUser(data, () => {
	                    this.setState({
	                        redirectToProfile: true
	                    });
	                });
	            }
	        });
	    }
	};

	signupForm = (name, email, password, about) => (
		<form>
			{/*<div className="form-group">
				<label className="text-muted">Profile Photo</label>
				<input  
					onChange={this.handleImageUpload("photo")} 
					type="file" 
					className="image/*" 
					className="form-control"
				/>
			</div>
			<div className="form-group">
				<label className="text-muted">Name</label>
				<input  
					onChange={this.handleChange("name")} 
					type="text" 
					className="form-control" 
					value={name}
				/>
			</div>
			<div className="form-group">
				<label className="text-muted">Email</label>
				<input 
					onChange={this.handleChange("email")} 
					type="email" 
					className="form-control" 
					value={email}
				/>
			</div>
			<div className="form-group">
				<label className="text-muted">About</label>
				<textarea rows="4" columns="50"
					onChange={this.handleNewLine("about")} 
					type="text" 
					className="form-control" 
					value={about}
				/>
			</div>*/}
			<div className="form-group">
				<label className="text-muted">Password [leave this field blank if you don't want to change your password]</label>
				<input 
					onChange={this.handleChange("password")} 
					type="password" 
					className="form-control" 
					value={password}
				/>
			</div>
			<button onClick={this.clickSubmit} className="btn btn-raised btn-primary">
				UPDATE
			</button>
		</form>
	);

	render() {
		const { id, name, email, password, redirectToProfile, error, loading, about } = this.state;

		if (redirectToProfile) {
			return <Redirect to={`/user/${id}`} />
		}

		const photoUrl = id ? 
		`${process.env.REACT_APP_API_URL}/user/photo/${id}?${new Date().getTime()}` : DefaultProfile;

		return (
			<div className="container">
				<h2 className = "mt-5 mb-5"> Edit Profile </h2>
				<div 
					className="alert alert-danger"

					style={{ display: error ?"" : "none"}}
				>
					{error}
				</div>

				{loading ? (
					<div className="jumbotron text-center">
						<h2>Loading...</h2>
					</div>
					) : (
							""
				)}			

				<img 
					style={{height: "200px", width: "auto"}}
					className="img-thumbnail"
					src={photoUrl} 
					onError={i => (i.target.src = `${DefaultProfile}`)}
					alt={name} 
				/>

				{(isAuthenticated().user.role === "admin" ||
				    isAuthenticated().user._id == id) &&
				        this.signupForm(name, email, password, about)}
			</div>
		);
	}
}

export default EditProfile