// QR Discovery Flow
//
// 1. Student scans a QR code.
//
// 2. The QR opens a URL like:
//    unlock.html?location=cs-department
//
// 3. Read the location ID from the URL.
//
// 4. Validate that the location exists.
//
// 5. Check if the user is authenticated.
//
// 6. Get the user's GPS location.
//
// 7. Verify that the user is close enough
//    to the actual campus location.
//
// 8. Check whether the user has already
//    discovered this location.
//
// 9. If valid:
//    - Record the discovery
//    - Award XP
//    - Update quest progress
//    - Update badges
//
// 10. Show the discovery result on unlock.html.