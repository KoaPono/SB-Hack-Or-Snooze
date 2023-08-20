"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
	console.debug("login", evt);
	evt.preventDefault();

	// grab the username and password
	const username = $("#login-username").val();
	const password = $("#login-password").val();

	// User.login retrieves user info from API and returns User instance
	// which we'll make the globally-available, logged-in user.
	currentUser = await User.login(username, password);
	myStories = currentUser.ownStories;

	$loginForm.trigger("reset");

	saveUserCredentialsInLocalStorage();
	updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
	console.debug("signup", evt);
	evt.preventDefault();

	const name = $("#signup-name").val();
	const username = $("#signup-username").val();
	const password = $("#signup-password").val();

	// User.signup retrieves user info from API and returns User instance
	// which we'll make the globally-available, logged-in user.
	currentUser = await User.signup(username, password, name);

	saveUserCredentialsInLocalStorage();
	updateUIOnUserLogin();

	$signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
	console.debug("logout", evt);
	localStorage.clear();
	location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
	console.debug("checkForRememberedUser");
	const token = localStorage.getItem("token");
	const username = localStorage.getItem("username");
	if (!token || !username) return false;

	// try to log in with these credentials (will be null if login failed)
	currentUser = await User.loginViaStoredCredentials(token, username);
	myStories = currentUser.ownStories;
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
	console.debug("saveUserCredentialsInLocalStorage");
	if (currentUser) {
		localStorage.setItem("token", currentUser.loginToken);
		localStorage.setItem("username", currentUser.username);
	}
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
	console.debug("updateUIOnUserLogin");

	$allStoriesList.show();

	updateNavOnLogin();
	putStoriesOnPage();
}

async function favoriteStory(evt) {
	console.debug("favoriteStory");
	if (evt.target.nodeName === "SPAN") {
    const storyId = evt.target.parentElement.id;
		if (evt.target.classList.contains("star")) {
			let method = "";
			const isAddingFavorite = evt.target.classList.contains("uncheck");
			if (isAddingFavorite) {
				evt.target.classList.remove("uncheck");
				evt.target.classList.add("check");
				method = "POST";
			} else {
				evt.target.classList.add("uncheck");
				evt.target.classList.remove("check");
				method = "DELETE";
			}
			const resp = await User.addOrDeleteUserFavorite(
				currentUser.loginToken,
				currentUser.username,
				storyId,
				method
			);
			const favStory = await getStory(storyId);
			if (isAddingFavorite) {
				currentUser.favorites.push(favStory);
				favoriteStories = currentUser.favorites;
			} else {
				favoriteStories = currentUser.favorites.filter(
					(val) => val.storyId !== storyId
				);
				currentUser.favorites = favoriteStories;
			}
		}
    if (evt.target.classList.contains("trash")) {
      const resp = await removeStory(storyId, currentUser.loginToken);
      evt.target.parentElement.innerHTML = "";
    }
	}
}

$($allStoriesList).on("click", favoriteStory);
$($favoriteStoriesList).on("click", favoriteStory);
$($myStoriesList).on("click", favoriteStory);

async function getStory(storyId) {
	const response = await axios({
		url: `${BASE_URL}/stories/${storyId}`,
		method: "GET",
	});

	let { story } = response.data;

	return new Story({
		author: story.author,
		createdAt: story.createdAt,
		storyId: story.storyId,
		title: story.title,
		updatedAt: story.updatedAt,
		url: story.url,
		username: story.username,
	});
}

async function removeStory(storyId, token) {
	const response = await axios({
		url: `${BASE_URL}/stories/${storyId}`,
		method: "DELETE",
    data: {token: token}
	});

	return response;
}
