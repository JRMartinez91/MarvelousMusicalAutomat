console.log("app.js linked to index.html")
$

/////////////////////////////////////
////// CURRENT ISSUES
/////////////////////////////////////
/*
    USER SONG ENTRY AUTOMATED

    -sub-task: genre drop-down menu still not implemented

    -task: add a delete button.
        -buttons should be hidden by default
        -when a sort of "unlock option to delete" button is presed,
         THEN the individual delete buttons of all titleCards appear.

         -DELETE BUTTON WORKS
         -but the buttons can only be hidden when they're ALL showing
            -NOT ANYMORE!
    
    SAVING AND LOADING SUCCESSFULLY IMPLEMENTED

    -export JSON of Jukebox object to TXT file as emergency backup?
    -creation of TXT files looks VERY involved. might be better just to
        make a big text box where the raw data is displayed and can be
        copied to a TXT file. 
*/

// function myFunction() {
//     /* Get the text field */
//     var copyText = document.getElementById("myInput");
  
//     /* Select the text field */
//     copyText.select();
//     copyText.setSelectionRange(0, 99999); /*For mobile devices*/
  
//     /* Copy the text inside the text field */
//     document.execCommand("copy");
  
//     /* Alert the copied text */
//     alert("Copied the text: " + copyText.value);
// }

//the icon OR text that will be displayed in every 'get link' button
const buttonImg = "GET";

//determines whether or not there is a popup alert when
//a song link is copied to the clipboard
let alertsOn = true;

class Track{
    constructor(title,link,genre){
        //constructor automatically cleans up accidental line breaks
        this.title=title.replace(/(\r\n|\r|\n)/gm,"")
        this.link=link.replace(/(\r\n|\r|\n)/gm,"")
        this.genre=genre.replace(/(\r\n|\r|\n)/gm,"")
    }

    //returns html for building title card and button for the Track
    //parameter n represents this Track's place in the Jukebox's songList
    parseTrack(n) {
        let titleCard = document.createElement('div');
        titleCard.classList.add("title-card");
        titleCard.innerHTML=`<div class="tc-sub-box">
            <h2 class=\'song-title\'>${this.title}</h2>
            <button class="deleteButton" onclick="deleteTrack(${n})">DELETE</button>
            </div>
            <button class="selectButton" onclick=\'jukebox.select(${n})\'>${buttonImg}</button>`;
        return titleCard;
    }

}

class Jukebox{
    constructor(name, songList=[], genreList=[]){
        this.name=name;
        this.songList = songList;
        this.genreList = genreList;
    }

    //called when the button of an individual song is clicked
    select(n){
        let command = `!play ${this.songList[n].link}`;
        let linkDisplay = document.getElementById('link-display')
        linkDisplay.innerText = command;
        linkDisplay.select();
        document.execCommand("copy");
        if(alertsOn){
            alert(`Copied to clipboard: ${this.songList[n].title}`);
        }
    }

    //adds a new track so long as a track with an identical name or link
    //is not already in the Jukebox
    //returns TRUE if push was successful, false otherwise.
    addTrack(newTrack){
        let duplicate = false;
        let alertMsg = "Cannot add new track: "
        //Check every preexisting song in this jukebox for duplicates
        for(let i=0; i<this.songList.length;i++){
            //if there is a Track on the list with an identical name or link...
            if(newTrack.title.toLowerCase()===this.songList[i].title.toLowerCase){
                duplicate = true;
                alertMsg += "Track with this title already exists. "
            }
            if(newTrack.link===this.songList[i].link){
                duplicate = true;
                alertMsg += "Track with this URL already exists."
            }
            //stop cycling through the song list as a soon as a duplicate is found
            if(duplicate){
                break;
            }
        }
        //if no duplicates have been found, add the Track
        if(!duplicate){
            this.songList.push(newTrack)
            return true;
        //if there is a duplicate, tell the user.
        } else {
            alert(alertMsg);
            return false;
        }
    }

    //scan through every song in the songList and compiles an array
    //of each named genre. This will be used later to generate the html
    createGenreList(){
        //create an empty array
        let newList = []
        //for every song on the list...
        for(let i=0; i<this.songList.length; i++){
            //if we encounter a genre name that we have not encountered before
            if(!newList.includes(this.songList[i].genre.toLowerCase())){
                //add it to the array
                newList.push(this.songList[i].genre.toLowerCase());
            }
        }
        //alphabetize the list;
        newList.sort();
        
        //update this jukebox's genreList
        this.genreList=newList
    }

    //creates a flexbox which contains a title card for every single track in a genre,
    //parameter n represents the index of the genre within the genreList.
    parseGenre(n){
        //create the outer box
        const genreBox = document.createElement('div');
        genreBox.classList.add('genre-box');
        //create the genre title text
        const genreTitle = document.createElement('h3');
        genreTitle.classList.add('genre-title');
        genreTitle.innerText = titleStyling(this.genreList[n]);
        //stick the title into the outer box
        genreBox.appendChild(genreTitle)
        //generate the inner box to hold the title cards
        const innerBox = document.createElement('div');
        innerBox.classList.add('inner-box');
        //give it a unqiue ID corresponding to the genre name
        let idTag = `${codeStyling(this.genreList[n])}-box`
        console.log(idTag)
        innerBox.setAttribute("id",idTag)
        //give the title element the ability to hide the box when clicked
        genreTitle.setAttribute("onclick","hideBox('"+idTag+"')")

        //make a title card out of each song that matches this genre
        //and stick each title card in the inner box

        let titleCard;

        //for each Track in this Jukebox...
        for(let i = 0; i<this.songList.length; i++){
            //if the Track's genre matches the argument passed to this function...
            if(this.songList[i].genre.toLowerCase()===this.genreList[n].toLowerCase()){
                //create a div element for its title card
                titleCard = this.songList[i].parseTrack(i);
                //and shove it into the genre box
                innerBox.appendChild(titleCard);
            } else {
                //console.log("rejected song:")
                //console.log(this.songList[i])
            }
        }
        
        //put the inner box inside the outer box!
        genreBox.appendChild(innerBox);
        //genreBox now contains a title heading for the name of the genre
        //and a titleCard for each song in the genre
        return genreBox;
    }

    //this is the big one. this writes the entire content of the HTML page.
    parseJukebox(){
        //create the space that all the genreBoxes will occupy.
        let allTracks = document.createElement('div');
        allTracks.classList.add("allTracks");

        let genreBox;
        
        //for each genre in this Jukebox...
        for(let i=0; i< this.genreList.length; i++){
            //get a box of all songs with that genre tag
            genreBox = this.parseGenre(i);
            //and add it to the big list
            allTracks.appendChild(genreBox);
        }
        //when this is complete, allTracks contains, per genre
        //a div element whose child nodes are all div elements
        //representing title cards for each song in said genre
        return allTracks;
    }
    
}

///////
/// Box Visibility Functions
///////

//toggle visibility of individual elements
const hideBox =(boxID)=>{
    $myBox = $(`#${boxID}`)

    //if myBox is hidden, show it
    if($myBox.is(':hidden')){
        $myBox.show(400);
    //if my Box is visible, hide it.
    } else{
        $myBox.hide(400);
    }
}

//toggle visibility of all elements in a class
const hideBoxes =(boxClass, timing=400)=>{
    $myBoxes = $(`.${boxClass}`)

    //if myBoxes are hidden, show them
       if($myBoxes.is(':hidden')){
        $myBoxes.show(timing);
    //if myBoxes are visible, hide them.
    } else{
        $myBoxes.hide(timing);
    }

}

//toggle visibility of DELETE buttons
//due to difficulties with the Lock/Unlock button that occur
//when some but not all delete buttons are visible, we have elected
//to give the 'lock/unlock delete buttons' process its own unique
//function. rather than checking if the elements are visible or not,
//to determine whether to show or hide them, it checks a global boolean value.
let deleteLocked = true;

const toggleDeleteBtn =()=>{
    $buttons = $(`.deleteButton`)
    $toggle = $('#lockDeletionBtn')

    //if myBoxes are hidden, show them
    if(deleteLocked){
        $buttons.show();
        $toggle.text("Lock Delete Buttons");
        $toggle.addClass('delete-alert');
    //if myBoxes are visible, hide them.
    }else{
        $buttons.hide();
        $toggle.text("Unlock Delete Buttons")
        $toggle.removeClass('delete-alert');
    }
    //
    deleteLocked = !deleteLocked;
}

//hide all titleCards
const hideAllBoxes = () => {
    $('.inner-box').hide(400);
}

//show all titleCards
const showAllBoxes = () => {
    $('.inner-box').show(400);
}

//an object
//keys are the IDs of every genre's inner-box
//values are booleans- true if visible, false if hidden

let visMemory = {}

//record the show/hide status of every genre's inner-box
const saveVisMemory =()=>{
    allBoxes = $('.inner-box');

    for(let i=0;i<allBoxes.length;i++){
        let thisBox = allBoxes.eq(i);
        //if the box is currently invisible
        if(thisBox.css('display')==='none'){
            //record this in the visMemory object
            visMemory[`${thisBox.attr('id')}`] = 0;
        } else {
            visMemory[`${thisBox.attr('id')}`] = 1;
        }
    }
}

//assign the saved show/hide status to every genre's inner-box
const loadVisMemory =()=>{
    allBoxes = $('.inner-box')
    
    for(let i=0;i<allBoxes.length;i++){
        let thisBox = allBoxes.eq(i);
        
        //check to see if this box existed the last time we used getVisMemory
        if(Object.keys(visMemory).includes(thisBox.attr('id'))){
            //if it is present, set its show/hide status to the one recorded in visMemory
            //if visible
            if(visMemory[thisBox.attr('id')]){
                //keep visible
                thisBox.show(0);
            //if hidden
            } else {
                //keep hidden
                thisBox.hide(0);
            }
        }
        //boxes whose status was not recorded will be visible by default
        //because this will only happen if they were created with the current
        //call of buildPage
    }
}


////////////
// Save/Load Functions
////////////

//store page's current jukebox object in local storage
const updateLocalJukebox = () => {
    savedJB.setItem('JB',jukebox)
}

const clearLocalStorage = () => {
    savedJB.clear();
}

const enableDeletion = () => {

}

//Add a new Track to the Jukebox from the Form
const newTrackEntry = () =>{
    //get name
    newTrackTitle = document.getElementById('name-form').value;
    console.log(newTrackTitle);
    //get link
    newTrackLink = document.getElementById('link-form').value;

    //IF there is a genre-card selected, assign its name as genre
    let noCardSelected = true;
    let cardList = $('.genre-card');
    for(let i=0;i<cardList.length;i++){
        if(cardList.eq(i).hasClass('selected-genre-card')){
            //if the selected card is "new genre", then assign nothing.
            //if(cardList.eq(i).text()!=="New Genre"){
                newTrackGenre = cardList.eq(i).text();
                noCardSelected = false;
            //}
        }
    }
    //ELSE, genre is whatever is in the text box.
    if(noCardSelected){
        newTrackGenre = document.getElementById('genre-form').value.replace(/-/g," ");
    }

    newTrack = new Track(newTrackTitle,newTrackLink,newTrackGenre);

    //if the new track has been successfully added, erase text in entry forms.
    if(jukebox.addTrack(newTrack)){
        $('#genre-form').val("")
        $('#name-form').val("")
        $('#link-form').val("")
    }
    console.log(jukebox);
    jukebox.createGenreList();
    buildPage();
}

//auxiliary to track entry, which previous genre card has been selected?
const selectGCard =(cardId)=>{
    card = document.getElementById(cardId)
    //if the card clicked on is already selected
    if(card.classList.contains('selected-genre-card')){
        //deselect it.
        card.classList.remove('selected-genre-card');
        //re-enable the genre entry text box, and empty its contents
        $("#genre-form").attr('disabled',false);
        document.getElementById('genre-form').value = ""

    //if the card clicked on is NOT selected
    } else {
        //first, deselect all cards
        allCards = $('.genre-card');
        for(let i=0;i<allCards.length;i++){
            allCards.eq(i).removeClass('selected-genre-card')
        }
        //then select the clicked card
        card.classList.add('selected-genre-card')
        //disable the genre entry text box
        //but enter the selected card's name in the box, for the sake of clarity
        document.getElementById('genre-form').value = $(`#${cardId}`).text();
        $("#genre-form").attr('disabled',true);
    }
}

//Delete a Track
const deleteTrack = (n) =>{
    jukebox.songList.splice(n,1);
    jukebox.createGenreList();
    buildPage();
}


/////////////
// Text Manipulation Functions
/////////////

//turns 'Cogito Ergo Sum' into 'cogito-ergo-sum'
const codeStyling =(text)=>{
    return text.replace(/ /g,"-").toLowerCase();
}

//turns 'cogito-ergo-sum' into "Cogito Ergo Sum"
const titleStyling=(text)=>{
    let str = text.replace(/-/g," ");
    let newStr = ""

    //capitalize first letter
    newStr += str.charAt(0).toUpperCase();
    //capitalize every letter that follows a space
    for(let i=1;i<str.length;i++){
        if(str[i-1]===" "){
            newStr+=str.charAt(i).toUpperCase();
        }else{
            newStr+=str.charAt(i);
        }
    }

    return newStr;
}




////////////////////////////////////
//// PART 1: initialize Jukebox
////////////////////////////////////

let savedJB = window.localStorage;

let jukebox;

// if there is already a Jukebox object in local storage,
if(savedJB.getItem('JB')){
    // assign it to the jukebox variable
    jukebox = JSON.parse(savedJB.getItem('JB'));
    //
    // PROBLEM: the jukebox object seems to LOSE its CLASS???
    //
    let savedSongList = jukebox.songList;
    //re-assign Track class to every element of savedSongList
    for(let i=0;i<savedSongList.length;i++){
        savedSongList[i]=new Track(savedSongList[i].title,savedSongList[i].link,savedSongList[i].genre)
    }
    let savedGenreList = jukebox.genreList;
    jukebox = new Jukebox("myJukebox",savedSongList,savedGenreList)
} else {
    //otherwise, create a new one.
    jukebox = new Jukebox("myJukebox");
}

////////////////////////////////////
//// PART 2: Manually Enter Song List
////////////////////////////////////

const addTestTracks = () =>{
jukebox.addTrack(new Track("Beezlebub","https://www.youtube.com/watch?v=P209Z6Io1zc","Horror"));
jukebox.addTrack(new Track("Beezlebub Again","https://www.youtube.com/watch?v=P209Z6Io1zc","Horror"));
jukebox.addTrack(new Track("Beezlebub A Third Time","https://www.youtube.com/watch?v=P209Z6Io1zc","Horror"));
jukebox.addTrack(new Track("Totally not Beezlebub","https://www.youtube.com/watch?v=P209Z6Io1zc","Caves"));
jukebox.addTrack(new Track("Drowning in the Sewer","https://www.youtube.com/watch?v=u0ZTcAOP9kk&t=516s","DarkChill"));
jukebox.createGenreList();
buildPage();
}



////////////////////////////////////
//// PART 3: Process Jukebox
////////////////////////////////////

jukebox.createGenreList();

////////////////////////////////////
//// PART 4: Convert the Jukebox's Data to Useable HTML
////////////////////////////////////

//this function will execute when the body element loads
const buildPage = () =>{
    //record visibility status of genre boxes
    saveVisMemory();
    //delte old track listing, if any exists
    $('.allTracks').remove();
    const thisPage = document.getElementsByTagName('body')[0];
    thisPage.appendChild(jukebox.parseJukebox());

    //save jukebox object to local storage
    savedJB.setItem('JB',JSON.stringify(jukebox));

    //delete old set of "preexisting genre" cards
    $('.genre-card').remove();

    //create new set of "preexisting genre" cards

    //first, a "New Genre" card
    /*let gCard = document.createElement('div');
    gCard.classList.add('genre-card')
    gCard.id = "default-genre-card";
    gCard.innerText = "New Genre";
    gCard.setAttribute("onclick","selectGCard('default-genre-card')")
    document.getElementById('genre-menu').appendChild(gCard);*/

    //then, cards for the genres recorded in the jukebox.
    for(let i=0; i<jukebox.genreList.length; i++){
        //create blank card
        gCard = document.createElement('div');

        //get ID
        gCardId = codeStyling(jukebox.genreList[i]);

        //format card
        gCard.classList.add('genre-card')
        gCard.innerText = titleStyling(jukebox.genreList[i])
        gCard.id = gCardId;
        gCard.setAttribute("onclick","selectGCard('"+gCardId+"')")

        //append card to menu
        document.getElementById('genre-menu').appendChild(gCard);
    }
    //hide delete buttons by default
    hideBoxes('deleteButton',0);
    //restore visibility status of genre boxes
    loadVisMemory();

}

//adding list of preexisting genres to 'add new song' form

//Building the page
    //divide Jukebox into one array per genre
    //for each Genre-array
        //create a big box to contain it
        //put a title at the top
        //write a Title Card for each track listing and put them in the big box
    //append each Genre-array to a signular master list
    //make that master list the bulk of the page

/////////////////////////////////////
//// PART 5: Saving and Loading
/////////////////////////////////////



