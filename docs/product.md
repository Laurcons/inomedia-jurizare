# About this application

This is a small web application to be used in a small but nation-wide competition across several schools. The competition is about creating and promoting short videos about historical events and figures. The application's role is to facilitate the process of tallying final votes and rankings across all participating schools.

## Language

The platform's language should be in Romanian, with complete diacritics.

## Actors

The actors involved in this app:

1. Coordinating Teacher: They are in charge of the students that do the actual voting. There is only one coordinating teacher per school, and a teacher can coordinate however many students.
2. Student: A student, as mentioned above.
3. Admin: competition organizers, have access to an overview of the voting process.

## Authentication

There is a unified login interface for all three actors. It works by email OTP login, sending a one-time 6 character code on the specified email.

There should be no registration feature, and all emails (and roles) are pre-seeded in the database. This supersedes the spec in `sequence.puml`. Note that videos are pre-seeded as well.

Authentication for teachers and admins should result in a session being created.

### Coordinating Teacher

They will login via OTP from the unified login page. Their account already exists.

### Admin

They will login via OTP from the unified login page. Their account already exists.

### Student

They will access the platform via a URL with a code. The platform should have a page where students can enter a code to enter, but it should also support logging in via a URL with the code built-in (same code). The code should be a 6 character alphanumeric uppercase string, that should avoid look-alike characters.

## User stories

- As a Teacher or Admin, I want to login into the platform via OTP, in a two-step two-page process.
- As a Teacher or Admin, I want to be able to resend the OTP once every minute.
- As a Teacher, if the voting period has not started, I want to be presented with a message telling me so and to come back later.
- As a Teacher, I want to be asked to select which voting process better suits my needs. The processes are defined in the `sequence.puml` diagram, as "Jurizare Simpla" and "Jurizare cu Elevi". The selected process cannot be changed. This preference should be saved on my account.
- As a Teacher in simple voting, I want to visually order the list of videos to vote, and produce a top 10 ordered list. I should be able to drag and drop videos, and also click to move up/down if I need. Moving by buttons should animate the movement. Each video card must present its thumbnail and title. My changes should be saved as I do them.
- As a Teacher in simple voting, when I feel ready, I want to press a "Cast vote" button.
- As a Teacher in student voting, I should not be able to cast a vote myself. "My" vote is the students' vote.
- As a Teacher in student voting, I should see a page instructing me what to do next. It should also provide the join code for students, provide the direct URL for student voting and an option to copy it, and a QR code with the direct URL. I should also have the option to regenerate the code, with a confirmation dialog. Regenerating the vote will not change past votes, but will not allow new ones under the old code.
- As a Teacher, I should be able to see the votes cast with my student code. I should be able to see the votes' student name and class. I should be able to click a Refresh button to refresh the content. I should be able to click a Remove button next to each vote, that will allow me to remove invalid votes. This will not make it disappear, but instead cross the name out, and turn the Remove button into an Undo button.
- As a Teacher, I should be able to see the current ranking based on all the aggregated votes. If no votes were cast yet, a message is shown instead. I should be able to click a Refresh button to reload the content.
- As a Teacher, when I know all my students have answered, I want to be able to send their votes in for counting.

- As a Student, I want to be able to access the platform by hitting the landing page and clicking "I am a Student". This will prompt me for the code.
- As a Student, I want to be able to access the voting page directly using a direct URL with the built-in code.
- As a Student, I need to be prompted for my name and class before being able to cast a vote.
- As a Student, I should be able to reorder the list of videos and generate a top-10 ranking. When I am ready, I should be able to Cast my vote.
- As a Student or Teacher (during voting), I should be able to see a list of all competition videos, with their title, thumbnail, and a button to open the YouTube link, via a button displayed above the voting list.
- As a Student, I want to be able to cast multiple votes (in turn) on the same device. No restrictions should be imposed. If casting another vote is desired, this new vote must be treated as another student's vote. Moderation (to prevent multiple votes per student) is done by the teacher.

- As an Admin, if voting has not been started, I want to see in the admin dashboard only a button prompting me to start voting.
- As an Admin, I want to see the current voting progress: a ranking of the currently top 10 videos, and the amount of points awarded to each.
- As an Admin, I want to see a list of all the teachers, along with their schools (with locality) and whether they have cast their vote or not. I should NOT be able to see their votes. For each Teacher it should be visible if they picked Simple voting or Student voting (or nothing yet), and if Student voting has been picked, I should also see the number of students that have cast their vote.
- As an Admin, I want to have a button to stop the voting. No more votes should be allowed after this, and Teachers and Students should see relevant messages on the platform.

## Voting

We will use a point-based ranking system (Borda count). Each position in a single top-10 vote is assigned a score, respectively 12, 10, 8, 7, 6, 5, 4, 3, 2, 1. The final score for a video is determined by adding together each vote's score for the given video, while ignoring votes that do not contain the given video in the ranking at all. The final ranking is obtained by ordering each video based on its total score.

Each vote MUST be a top 10 ranking of the videos. Due to the nature of the interface, it should be impossible to submit a vote with less than 10 items (given there are more than 10 total videos).

Note that student votes should not count directly to the final vote. All the student votes that pertain to a teacher should be aggregated in isolation to other votes, and produce a single point-less ranking that is attached to the teacher. This ranking should be then re-scored (12 to 1) and participate in the nation-wide scoring.

Note that votes should be treated as belonging to a school, not to a teacher. A teacher's simple vote is but an aggregation of multiple students' vote, but performed outside the platform to make it easier. A set of votes pertaining to a teacher is considered to pertain to the school the teacher belongs to.

## Database

The app will run a MongoDB database, and connect via connection string.

Below is an overview of some entities involved:

### Teacher

Identifies a teacher. It has an email, the name of coordinated school, locality and county of the school, a full name, and a count of coordinated students (1, 2, 3, or 4+).

### Admin

Identifies an admin. It has an email and name.

### Video

Identifies a video to be ranked. It has a title, a school (with locality and county)(separate fields), a thumbnail URL and a link to YouTube.

All other entities are free to be modeled to taste and need. The aforementioned entities can be extended too.

## Architecture

The project should be built using Next JS with standard coding practices and a sensible eslint/prettier configuration.

The UI framework should be Bootstrap 5.

The frontend should be responsive in a mobile-first manner.

The frontend should be focused on server-side rendering, with API calls only when performing dynamic actions. The rule of thumb is to use API calls only when the only alternative is a form-based POST request (we want to avoid those).

Sensible and user-friendly errors should be displayed and returned on the most common error cases.

Emails should be sent via SMTP. The credentials will be filled in later.
