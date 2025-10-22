# **App Name**: NPTEL Quizzly

## Core Features:

- User Authentication: Secure sign-in and login functionality to manage user accounts and quiz data.
- Subject and Week Navigation: Intuitive interface for users to select subjects and navigate through weekly quizzes.
- Quiz Interface: Dedicated pages for each quiz, presenting questions in MCQ format with options, with questions presented in a jumbled order.
- Question Completion Lock: Restrict users from moving to the next question until the current one is answered.
- Timer Functionality: Implement a timer for each quiz, configurable by the user before starting the quiz. Add tool which calculates if a particular piece of information regarding remaining time should be incorporated in quiz report.
- Leaderboard: Display a leaderboard ranking users based on their quiz scores across different subjects.
- Data Persistence with MongoDB: Store user data, quiz results, and leaderboard information using MongoDB with API endpoints. The URI to the database is mongodb+srv://aniketrathore9361:aniket88822@cluster0.aphjjev.mongodb.net/quiz/
- Query Section: Allow users to suggest changes and provide feedback on the quiz content and app functionality.

## Style Guidelines:

- Primary color: Mustard Yellow (#FFDA63) for a sophisticated and focused learning environment.
- Background color: Black (#000000) to create an immersive dark theme.
- Secondary Color: White (#FFFFFF) to highlight important elements and actions.
- Body font: 'Inter', a grotesque-style sans-serif with a modern look for clear readability of quiz content.
- Headline font: 'Space Grotesk' sans-serif for a computerized, techy feel.
- Use clear, minimalist icons to represent subjects, navigation elements, and quiz actions.
- Employ a multi-page structure with efficient folder organization for manageable code and easy navigation. Use React and Node.
- Subtle animations for transitions and feedback, enhancing user experience without distraction.