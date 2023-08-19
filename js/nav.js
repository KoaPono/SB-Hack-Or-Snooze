"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */
function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */
function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}
$navLogin.on("click", navLoginClick);

function navOpenNewStoryForm(evt) {
  console.debug("navOpenNewStoryForm", evt);
  $storySubmitForm.show();
}
$navStorySubmit.on("click", navOpenNewStoryForm);

function navOpenFavoriteStories(evt) {
  console.debug("navOpenFavoriteStories", evt);
  showFavoriteStories();
}
$navFavorites.on("click", navOpenFavoriteStories);

function navOpenMyStories(evt) {
  console.debug("navOpenMyStories", evt);
  showMyStories();
}
$navMyStories.on("click", navOpenMyStories);

/** When a user first logins in, update the navbar to reflect that. */
function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}