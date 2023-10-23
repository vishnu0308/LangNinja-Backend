
# LangNinja Backend

This repo is the backend of LangNinja website, which is a personalized learning via quizzing platform to become a master of multiple languages.



## Features

- Quiz generator based on level
- Answers saved in database. Can continue quiz anytime
- Authentication using email or Google OAuth
- Stats of previous excercises
- Leaderboard for each language


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`PORT= <port the backend should run on ex: 4445>`

`NODE_ENV= development`

`REACT_APP_FRONTEND_URL= <ex: http://localhost:3000>`

`SERVER_URL= <ex: http://localhost:4445>`

`MONGO_URL= <url of mongodb server>`

`JWT_SECRET= <this secret string will be used for generating tokens>`

`EMAIL_USERNAME = <This is the mail id from which verification mails will be sent>`

`EMAIL_PASSWORD = <if gmail : use an app password>`

`GOOGLE_CLIENT_ID= <OAUTH client id>`

`GOOGLE_CLIENT_SECRET= <OAUTH client secret>`
## Run Locally

Clone the project

```bash
  git clone git@github.com:vishnu0308/LangNinja-Backend.git
```

Go to the project directory

```bash
  cd LangNinja-Backend
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npx nodemon index.js
```


## API Reference

### Admin related
#### Upload Questions to database

```http
  POST lang/upload-questions-csv
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `language` | `string` | **Required**. The name of the language that the questions need to be added to. |
| `file` | `file` | **Required**. The csv file containing the questions. (Each line should be of form "question,marks,option 1,option 2, option 3,option 4, answer") |

### Auth Related

#### Signing up with email

```http
  POST auth/signup
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `name` | `string` | **Required**. Name of the user|
| `email` | `string` | **Required**. Email. The verification link will be sent to this mail|
| `password` | `string` | **Required**. A strong Password|

#### Verification link - Link is sent to user's mail id.

```http
  POST auth/verify-mail/{verificationToken}
```


#### Signing in - Only verified users can sign in

```http
  POST auth/signin
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Required**. Verified Email|
| `password` | `string` | **Required**. Your Password|


#### Sign out

```http
  POST auth/signout
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `Authorization Bearer <token>` | `string` | **Required**. JWT Token Header to identify the user session |

#### Forgot Password - Mail will be sent 

```http
  POST auth/forgot-password
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Required**. Email address of the user|

#### Change Password - Obtained from forgot password mail 

```http
  POST auth/change-password/{verificationToken}
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `password` | `string` | **Required**. New password|

#### Change password while logged in

```http
  POST auth/change-password-with-old-password
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `Authorization Bearer <token>` | `string` | **Required**. JWT Token Header to identify the user session |
| `oldPassword` | `string` | **Required**. Old password|
| `newPassword` | `string` | **Required**. New password|



### Adding and viewing languages
#### Unlock a new language 

```http
  POST lang/unlock-language
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `Authorization Bearer <token>` | `string` | **Required**. JWT Token Header to identify the user session |
| `language` | `string` | **Required**. Language to be unlocked|

#### Get languages and levels of a user

```http
  POST lang/get-user-languages
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `Authorization Bearer <token>` | `string` | **Required**. JWT Token Header to identify the user session |

#### Get all languages available in the database

```http
  POST lang/get-all-languages
```

### Quiz related
#### Get Quiz questions for user

```http
  POST quiz/get-quiz-questions
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `Authorization Bearer <token>` | `string` | **Required**. JWT Token Header to identify the user session |
| `language` | `string` | **Required**. Language for quiz question generation|



#### Save answer to a question

```http
  POST quiz/save-answer
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `Authorization Bearer <token>` | `string` | **Required**. JWT Token Header to identify the user session |
| `language` | `string` | **Required**. Language to identify user's quiz session|
| `question_id` | `String(ObjectId)` | **Required**._id of the question chosen by user|
| `option_choosed` | `integer` | **Required**. Option choosed by user|

#### Quit current quiz

```http
  POST quiz/quit-quiz
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `Authorization Bearer <token>` | `string` | **Required**. JWT Token Header to identify the user session |
| `language` | `string` | **Required**. Language to identify user's quiz session|


#### Submit quiz - [Uses the answers stored in db to evaluate and returns scores and correct answers]

```http
  POST quiz/submit-quiz
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `Authorization Bearer <token>` | `string` | **Required**. JWT Token Header to identify the user session |
| `language` | `string` | **Required**. Language to identify user's quiz session|

### Stats Related

#### Get user's stats - Returns a list of stats for each language the user is enrolled in.

```http
  POST stats/get-my-stats
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `Authorization Bearer <token>` | `string` | **Required**. JWT Token Header to identify the user session |


#### Get leaderboard of a language

```http
  POST stats/get-leaderboard
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `Authorization Bearer <token>` | `string` | **Required**. JWT Token Header to identify the user session |
| `language` | `string` | **Required**. Language to get leaderboard|


#### Reset progress in a language

```http
  POST stats/reset-progress
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `Authorization Bearer <token>` | `string` | **Required**. JWT Token Header to identify the user session |
| `language` | `string` | **Required**. Language to reset progress in.|

