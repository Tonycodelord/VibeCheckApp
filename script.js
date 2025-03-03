// ✅ Ensure Firebase is available before using it
if (typeof firebase === "undefined") {
    console.error("❌ Firebase SDK not loaded! Check script order in index.html.");
}

// ✅ Define Firebase Services (Firebase is now properly initialized in index.html)
const database = firebase.database();
const auth = firebase.auth();
const storage = firebase.storage();

// 📌 Track Current User
let currentUser = null;

// 🚀 Google Sign-In Function
function signIn() {
    let provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(result => {
            console.log("✅ Signed in:", result.user);
            currentUser = result.user;

            let userData = {
                uid: result.user.uid,
                name: result.user.displayName,
                email: result.user.email,
                profilePicture: result.user.photoURL,
                lastLogin: Date.now()
            };

            // 🔥 Save User Data in Firebase
            database.ref("users/" + userData.uid).update(userData);

            updateAuthUI();
        })
        .catch(error => {
            console.error("❌ Google Sign-In Failed:", error.message);
            alert("Google Sign-In Failed: " + error.message);
        });
}

// 🚀 Google Sign-Out Function
function signOut() {
    auth.signOut().then(() => {
        console.log("✅ Signed out.");
        currentUser = null;
        updateAuthUI();
    });
}

// 🎭 Update UI Based on Login Status
function updateAuthUI() {
    let loginBtn = document.getElementById("loginBtn");
    let logoutBtn = document.getElementById("logoutBtn");
    let userStatus = document.getElementById("userStatus");

    if (auth.currentUser) {
        currentUser = auth.currentUser;
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        userStatus.innerText = `Signed in as ${currentUser.displayName}`;
        loadMoods();
        loadPublicMoods();
    } else {
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
        userStatus.innerText = "Not Signed In";
        document.getElementById("moodList").innerHTML = "";
        document.getElementById("publicMoodList").innerHTML = "";
    }
}

// 🔄 Listen for Auth State Changes
auth.onAuthStateChanged(user => {
    currentUser = user;
    updateAuthUI();
});

// 🎭 Update Mood & Save to Firebase
function updateMood(selectedMood) {
    if (!currentUser) {
        alert("Please sign in to save your mood.");
        return;
    }

    let moodDisplay = document.getElementById("moodDisplay");

    let moodEmojis = {
        "happy": "😊", "excited": "🤩", "calm": "😌",
        "sad": "😢", "angry": "😡", "relaxed": "😎", "neutral": "😐"
    };

    let emoji = moodEmojis[selectedMood] || "😐";
    moodDisplay.textContent = emoji + " " + selectedMood;

    let userMoodsRef = database.ref("users/" + currentUser.uid + "/moods").push();
    userMoodsRef.set({
        mood: selectedMood,
        emoji: emoji,
        timestamp: Date.now()
    });

    let publicMoodsRef = database.ref("publicMoods").push();
    publicMoodsRef.set({
        userId: currentUser.uid,
        username: currentUser.displayName,
        profilePicture: currentUser.photoURL,
        mood: selectedMood,
        emoji: emoji,
        timestamp: Date.now(),
        likes: 0
    });

    loadMoods();
}

// 🔄 Load Public Moods
function loadPublicMoods() {
    let publicMoodList = document.getElementById("publicMoodList");
    publicMoodList.innerHTML = "";

    database.ref("publicMoods").limitToLast(10).on("value", (snapshot) => {
        publicMoodList.innerHTML = "";

        snapshot.forEach((childSnapshot) => {
            let moodData = childSnapshot.val();
            let moodKey = childSnapshot.key;

            let li = document.createElement("li");
            li.innerHTML = `
                <img src="${moodData.profilePicture}" alt="Profile Picture" width="30">
                <strong>${moodData.username}:</strong> ${moodData.emoji} ${moodData.mood} 
                <button onclick="likeMood('${moodKey}', ${moodData.likes})">❤️ ${moodData.likes}</button>
            `;
            publicMoodList.prepend(li);
        });
    });
}

// 🔄 Profile Functions
function showUserProfile() {
    if (!currentUser) {
        alert("Please sign in to view your profile.");
        return;
    }

    document.getElementById("profilePage").style.display = "block";
    document.getElementById("authSection").style.display = "none";
    document.getElementById("publicMoodList").style.display = "none";

    let userRef = database.ref("users/" + currentUser.uid);
    userRef.once("value", (snapshot) => {
        if (snapshot.exists()) {
            let userData = snapshot.val();
            document.getElementById("profilePic").src = userData.profilePicture || currentUser.photoURL;
            document.getElementById("profileName").textContent = userData.name;
        }
    });

    loadUserMoods();
}

function loadUserMoods() {
    let userMoodList = document.getElementById("userMoodList");
    userMoodList.innerHTML = "";

    database.ref("users/" + currentUser.uid + "/moods").once("value", (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            let moodData = childSnapshot.val();
            let li = document.createElement("li");
            li.textContent = `${moodData.emoji} ${moodData.mood}`;
            userMoodList.appendChild(li);
        });
    });
}

function uploadProfilePicture() {
    let fileInput = document.getElementById("profilePicInput");
    let file = fileInput.files[0];

    if (!file) {
        alert("Please select an image to upload.");
        return;
    }

    let storageRef = storage.ref("profilePictures/" + currentUser.uid);
    let uploadTask = storageRef.put(file);

    uploadTask.on("state_changed", 
        () => {},
        (error) => alert("Failed to upload profile picture."),
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                database.ref("users/" + currentUser.uid).update({ profilePicture: downloadURL });
                document.getElementById("profilePic").src = downloadURL;
                alert("✅ Profile picture updated!");
            });
        }
    );
}

function closeUserProfile() {
    document.getElementById("profilePage").style.display = "none";
    document.getElementById("authSection").style.display = "block";
    document.getElementById("publicMoodList").style.display = "block";
}




