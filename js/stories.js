"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let favoriteStories;
let myStories;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
	storyList = await StoryList.getStories();
	$storiesLoadingMsg.remove();

	putStoriesOnPage();
}

function showFavoriteStories() {
	console.debug("showFavoriteStories");

	$allStoriesList.hide();
  $myStoriesList.hide();
  $favoriteStoriesList.empty();

	// loop through all of our stories and generate HTML for them
	for (let story of favoriteStories) {
		const $story = generateStoryMarkup(story);
		$favoriteStoriesList.append($story);
	}

	$favoriteStoriesList.show();
}

function showMyStories() {
  console.debug("showMyStories");

	$allStoriesList.hide();
  $favoriteStoriesList.hide();
  $myStoriesList.empty();

	// loop through all of our stories and generate HTML for them
	for (let story of myStories) {
		const $story = generateStoryMarkup(story, true);
		$myStoriesList.append($story);
	}

	$myStoriesList.show();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */
function generateStoryMarkup(story, isMyStories) {
	// console.debug("generateStoryMarkup", story);

	const hostName = story.getHostName();
  let favoritesMarkup = "";
  let trashMarkup = "";

  if (isMyStories) {
    trashMarkup = `<span class="trash"></span>`
  }
  if (currentUser) {
    favoriteStories = currentUser.favorites;
    const filteredStories = favoriteStories.filter(val => val.storyId === story.storyId);
    if (filteredStories.length > 0) {
      favoritesMarkup = `<span class="star check"></span>`
    } else {
      favoritesMarkup = `<span class="star uncheck"></span>`
    }
  }
	return $(`
      <li id="${story.storyId}">
        ${trashMarkup}
        ${favoritesMarkup}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */
function putStoriesOnPage() {
	console.debug("putStoriesOnPage");

	$allStoriesList.empty();

	// loop through all of our stories and generate HTML for them
	for (let story of storyList.stories) {
		const $story = generateStoryMarkup(story);
		$allStoriesList.append($story);
	}

	$allStoriesList.show();
}

async function submitStory(evt) {
  console.debug("submitStory", evt);
  evt.preventDefault();

  const title = $("#new-story-title").val();
  const author = $("#new-story-author").val();
  const url = $("#new-story-url").val();

  const newStory = {title, author, url};
  const ret = await storyList.addStory(currentUser, newStory);
  myStories.push(new Story(ret.data.story));
  console.log("story Added");
  getAndShowStoriesOnStart();

  $("#new-story-title").val("")
  $("#new-story-author").val("");
  $("#new-story-url").val("");
  $storySubmitForm.hide();
}

$storySubmit.on("click", submitStory);
