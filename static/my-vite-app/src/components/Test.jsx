import React, { useState, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { FaPlay, FaArrowLeft } from 'react-icons/fa';
import { useUser } from "../context/UserContext";
import useFetch from "../hooks/useFetch";

const Test = () => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token'));
  const { currentUser, setCurrentUser, lvl, setLvl, petLevel, setPetLevel, activeClassroomId, activeClassroomName, setActiveClassroomId, userClassrooms, setActiveClassroomName, activity, setActivity, isEnglish, setIsEnglish } = useUser();
  const [activeCharacterVoiceMute, setActiveCharacterVoiceMute] = useState(false)
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [tests, setTests] = useState([]);
  const [testQuestions, setTestQuestions] = useState({ questions: [] });
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questions, setQuestions] = useState(null);
  const [maxScores, setMaxScores] = useState([]);
  const [userInputs, setUserInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFinals, setActiveFinals] = useState(false);
  const [activeTestId, setActiveTestId] = useState(null);
  const [activeTestName, setActiveTestName] = useState('');
  const [activeTestDescription, setActiveTestDescription] = useState('');
  const [activeTestDescriptionSound, setActiveTestDescriptionSound] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeMemories, setActiveMemories] = useState(false);
  const [activeEikenMemories, setActiveEikenMemories] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [leaveModal, setLeaveModal] = useState(false);
  const [signupModal, setSignupModal] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [currentCorrectAudioIndex, setCurrentCorrectAudioIndex] = useState(0);
  const [currentWrongAudioIndex, setCurrentWrongAudioIndex] = useState(0);
  const [recordMessage, setRecordMessage] = useState('');
  const [message, setMessage] = useState("");
  const [joinedClassroomName, setJoinedClassroomName] = useState("");
  const [changedStudentNumber, setChangedStudentNumber] = useState("");
  const [changedLastName, setChangedLastName] = useState("");
  const [createdClassroomName, setCreatedClassroomName] = useState("");
  const [cookies, setCookie, removeCookie] = useCookies(['csrftoken']);
  const [correctAnswerKey, setCorrectAnswerKey] = useState('');
  const [correctWord, setCorrectWord] = useState('');
  const [correctSound, setCorrectSound] = useState('');
  const [correctPicture, setCorrectPicture] = useState('');
  const [correctLabel, setCorrectLabel] = useState('');
  const [correctEikenWord, setCorrectEikenWord] = useState('');
  const [randomizedValues, setRandomizedValues] = useState({});
  const [randomizedOptions, setRandomizedOptions] = useState({});
  const [correctOption, setCorrectOption] = useState(false);
  const [isPlayDisabled, setIsPlayDisabled] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isPractice, setIsPractice] = useState(false);

  const correctAudioUrls = window.correctAudioUrls;
  const wrongAudioUrls = window.wrongAudioUrls;
  const correctEnglishAudioUrls = window.correctEnglishAudioUrls;
  const wrongEnglishAudioUrls = window.wrongEnglishAudioUrls;

  const initialGameState = {
    scoreCounter: 0,
    testScores: {},
    activeQuestionIndex: 0,
    shuffledKeys: [],
  };

  const gameReducer = (state, action) => {
    switch (action.type) {
        case 'INCREMENT_SCORE':
            return {
                ...state,
                scoreCounter: state.scoreCounter + 1,
                testScores: {
                    ...state.testScores,
                    [action.payload.testId]: (state.testScores[action.payload.testId] || 0) + 1,
                },
            };
        case 'SET_ACTIVE_QUESTION_INDEX':
            return {
                ...state,
                activeQuestionIndex: action.payload,
            };
        case 'SET_SHUFFLED_KEYS':
            return {
                ...state,
                shuffledKeys: action.payload,
            };
        case 'RESET_GAME':
          return {
            ...initialGameState,
            shuffledKeys: state.shuffledKeys,
          };
        default:
            return state;
    }
  };

  const [gameState, dispatchGame] = useReducer(gameReducer, initialGameState);

  const formatText = (text) => {
    if (text.includes('B:')) {
      const parts = text.split('B:');
      return (
        <>
          <p>{parts[0]}</p>
          <p>B:{parts[1]}</p>
        </>
      );
    } else {
      return <p>{text}</p>;
    }
  };


  const openModal = () => {
    if (isPractice) {
      setActiveTestDescription('')
      setActiveTestDescriptionSound('')
    }
    if (isPractice || gameState.activeQuestionIndex === 0) {
      setActiveTestId(null);
      setActiveFinals(false);
    } else {
      setModalIsOpen(true);
    }
  };

  const closeReturnModal = () => {
    setModalIsOpen(false);
  };

  const openLeaveModal = () => {
    setLeaveModal(true);
  };

  const closeLeaveModal = () => {
    setLeaveModal(false);
  };

  const openSignupModal = () => {
    setSignupModal(true);
  };

  const closeSignupModal = () => {
    setSignupModal(false);
  };
  

  const handleBackClick = () => {
    closeReturnModal();
    if (activeTestId !== undefined) {
      recordScore(activeTestId);
      toggleQuestionDetails(activeTestId);
    } else {
      recordFinalsScores(activeCategory);
      setActiveFinals(false);
      setActiveTestId(null);
    }
  };

  const handleLeave = () => {
    closeLeaveModal();
    handleLeaveClassroom(currentUser.id, activeClassroomId);
  };



  const fetchMaxScores = async (userId) => {
    try {
      setError(null);
      const maxScoresResponse = await axios.get(`/api/maxscore/by-user/${userId}/`);
      console.log('Fetched sessions:', maxScoresResponse.data);
      return maxScoresResponse.data;
    } catch (error) {
      console.error('Error fetching maxScores:', error);
      setError('Failed to fetch maxScores.');
    }
  };
  







  const fetchTestsByCategory = async (category) => {
    try {
      const response = await axios.get(`/api/name-id-tests/by-category/?category=${category}`);
      setTests(prevTests => ({
        ...prevTests,
        [`category_${category}`]: response.data,
      }));
      return response.data;
    } catch (error) {
      console.error(`Error fetching tests for category ${category}:`, error);
    }
  };



  const fetchQuestionsByTest = async (testId) => {
    try {
      const response = await axios.get(`/api/test-questions/one-question/${testId}/`);
      setQuestions(response.data);
    } catch (error) {
      console.error(`Error fetching question for test ${testId}:`, error);
    }
  };


  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };




  const fetchTestQuestionsAndOptions = async (testId, numberOfQuestions = 10, category) => {
    try {
      setLoading(true);
      setError(null);

      let apiUrl = category 
        ? `/api/test-questions/by-category/${category}/` 
        : `/api/test-questions/by-test/${testId}/`;

      const testQuestionsResponse = await axios.get(apiUrl);
      const fetchedQuestions = testQuestionsResponse.data;
      let questions = fetchedQuestions.flatMap((question) =>
        Array(category ? 5 : numberOfQuestions).fill(null).map((_, index) => ({ ...question, duplicateId: `${question.id}-${index}` }))
      );

      if (category) {
        questions = questions.map(question => ({
            ...question,
            category: category,
        }));
      }

      const oneQuestion = questions.find(q => q.sound3) || questions[0];
      setQuestions(oneQuestion);


      if (oneQuestion && oneQuestion.question_list) {
        const keys = Object.keys(oneQuestion.question_list);
        const shuffled = shuffleArray([...keys]);
        dispatchGame({
          type: 'SET_SHUFFLED_KEYS',
          payload: shuffled,
        });
      }

      setTestQuestions((prevQuestions) => ({
        ...prevQuestions,
        questions: [...(prevQuestions.questions || []), ...questions],
      }));
      if (category) {
        setTotalQuestions(questions.filter(question => (question.category === activeCategory)).length);
      } else {
        setTotalQuestions(questions.filter(question => (question.test === testId && !question.category)).length);
      }
      setLoading(false);

      const randomizedValues = questions.reduce((acc, question) => {
        const keys = Object.keys(question.question_list);
        const shuffledKeys = shuffleArray([...keys]);

        const unusedKeys = keys.filter(key => !Object.values(acc).some(item => item.randomAlphabet === key));

        const randomKey = unusedKeys.length > 0
          ? unusedKeys[Math.floor(Math.random() * unusedKeys.length)]
          : keys[Math.floor(Math.random() * keys.length)];

        const randomValue = question.question_list[randomKey];


        let randomAlphabetSliced = null;
        if (question.first_letter) {
          randomAlphabetSliced = `_${randomKey.slice(1)}`;
        } else if (question.second_letter) {
          randomAlphabetSliced = `${randomKey[0]}_${randomKey.slice(2)}`;
        } else if (question.third_letter) {
          randomAlphabetSliced = `${randomKey.slice(0, 2)}_${randomKey.slice(3)}`;
        } else if (question.last_letter) {
          randomAlphabetSliced = `${randomKey.slice(0, randomKey.length - 1)}_`;
        }

        const isArray = Array.isArray(randomValue)
        const isArrayfour = Array.isArray(randomValue) && randomValue.length >= 4

        acc[question.duplicateId] = {
          randomAlphabetSliced : randomAlphabetSliced,
          randomAlphabet: randomKey || null,
          randomUrl: !isArray ? randomValue : null,
          randomTranslation: isArray ? randomValue[0] : null,
          randomEikenUrl: isArray ? randomValue[1] : null,
          randomWrongOne: isArrayfour ? randomValue[0] : null,
          randomWrongTwo: isArrayfour ? randomValue[1] : null,
          randomWrongThree: isArrayfour ? randomValue[2] : null,
          randomCorrect: isArrayfour ? randomValue[3] : null,
          randomNumbers: randomValue.numbers || null,
          randomWord: randomValue.word ? (Array.isArray(randomValue.word) ? randomValue.word[0] : randomValue.word) : randomValue.word || null,
          randomWord2: randomValue.word2 || null,
          randomJapanese: randomValue.japanese || null,
          randomPicture: randomValue.picture || null,
          randomSound: randomValue.sound || null,
          randomSound2: randomValue.sound2 || null,
          randomSound3: randomValue.sound3 || null,
          randomLabel: randomValue.label || null,
        };

        return acc;
      }, {});



      setRandomizedValues(randomizedValues);

      const randomizedOptions = questions.reduce((acc, question) => {
        const options = question.options;
        const shuffledOptions = shuffleArray([...options]);
        const optionKeys = Object.keys(question.question_list)
        const selectedKeys = new Set();

        const randomizedOptionsForQuestion = shuffledOptions.map((option) => {
          let randomOptionKey;
          do {
            randomOptionKey = optionKeys[Math.floor(Math.random() * optionKeys.length)];
          } while (randomOptionKey === randomizedValues[question.duplicateId].randomAlphabet || selectedKeys.has(randomOptionKey));

          selectedKeys.add(randomOptionKey);
          return { ...option, randomOptionKey };
        });

        acc[question.duplicateId] = randomizedOptionsForQuestion;
        return acc;
      }, {});

      setRandomizedOptions(randomizedOptions);

    } catch (error) {
      console.error('Error fetching test questions and options:', error);
      setError('Failed to fetch test questions and options.');
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (changedStudentNumber === "" && changedLastName === "") {
      alert("出席番号または名字を入力してください！");
      return;
    }

    try {
      const csrfToken = cookies.csrftoken;
      const response = await axios.post(
        "/update/profile/",
        { studentNumber: changedStudentNumber, lastName: changedLastName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "X-CSRFToken": csrfToken
          },
        }
      );
      if (response.data.status === "success") {
        const newStudentNumber = response.data.student_number;
        const newLastName = response.data.last_name;
        setCurrentUser((prevUser) => {
          if (!prevUser) return prevUser;

          const updatedUser = { ...prevUser };

          if (newLastName !== "") {
            updatedUser.last_name = newLastName;
          }
        
          if (newStudentNumber !== "" && prevUser.student) {
            updatedUser.student = { 
              ...prevUser.student, 
              student_number: newStudentNumber 
            };
          }
        
          return updatedUser;
        });
      }

      setMessage({ type: response.data.status, text: response.data.message });
      setChangedLastName("");
      setChangedStudentNumber("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "An error occurred.",
      });
    }
  };


  const handleJoinSubmit = async (e) => {
    e.preventDefault();

    if (currentUser?.student?.classrooms.some(c => c.name === joinedClassroomName) || currentUser?.teacher?.classrooms.some(c => c.name === joinedClassroomName) ) {
      alert("この教室はすでに入っている！");
      return;
    }

    try {
      const csrfToken = cookies.csrftoken;
      const response = await axios.post(
        "/join_classroom/",
        { classroom_name: joinedClassroomName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "X-CSRFToken": csrfToken
          },
        }
      );
      if (response.data.status === "success") {
        const newClassroom = response.data.classroom;
        setCurrentUser((prevUser) => {
          if (!prevUser) return prevUser;
          const updatedUser = { ...prevUser };
  
          if (updatedUser.student) {
            updatedUser.student = { 
              ...updatedUser.student, 
              classrooms: [...updatedUser.student.classrooms, newClassroom]
            };
          } else if (updatedUser.teacher) {
            updatedUser.teacher = { 
              ...updatedUser.teacher, 
              classrooms: [...updatedUser.teacher.classrooms, newClassroom]
            };
          }

          setActiveClassroomId(newClassroom.id);
          setActiveClassroomName(newClassroom.name);
  
          return updatedUser;
        });
      }
      setMessage({ type: response.data.status, text: response.data.message });
      setJoinedClassroomName("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "An error occurred.",
      });
    }
  };

  const handleClassroomCreateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const csrfToken = cookies.csrftoken;
      const response = await axios.post(
        "/classroom/create/",
        { classroom_name: createdClassroomName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "X-CSRFToken": csrfToken
          },
        }
      );
      if (response.data.status === "success") {
        const newClassroom = response.data.classroom;
        setCurrentUser((prevUser) => {
          if (!prevUser) return prevUser;
          const updatedUser = { ...prevUser };
      
          updatedUser.teacher = { 
            ...updatedUser.teacher, 
            classrooms: [...updatedUser.teacher.classrooms, newClassroom]
          };
      
          return updatedUser;
        });
      }    

      setMessage({ type: response.data.status, text: response.data.message });
      setCreatedClassroomName("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "An error occurred.",
      });
    }
  };

  const recordFinalsScores = async (category) => {
    try {
      const csrfToken = cookies.csrftoken;
      const data = { scores: gameState.testScores };
  
      const response = await axios.post(`/final/${category}/score/`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'X-CSRFToken': csrfToken
        }
      });
      const rd = response.data
      const message = rd.message;
      setRecordMessage(message);
      setShowModal(true);

      setCurrentUser((prevUser) => ({
        ...prevUser,
        total_english_5_score: rd.user_data.total_english_5_score,
        total_english_6_score: rd.user_data.total_english_6_score,
        total_phonics_score: rd.user_data.total_phonics_score,
        total_numbers_score: rd.user_data.total_numbers_score,
        total_eiken_score: rd.user_data.total_eiken_score,
        total_max_scores: rd.user_data.total_max_scores,
      }));
      const level = Math.floor((rd.user_data.total_eiken_score + rd.user_data.total_numbers_score + rd.user_data.total_phonics_score) / 50);
      setPetLevel(level);
      const user_level = Math.floor((rd.user_data.total_max_scores) / 50);
      setLvl(user_level)
  
    } catch (error) {
      console.error('Error recording test scores:', error);
      setError('Failed to record test scores.');
      setSignupModal(true);
    }
  };

  const recordScore = async (testId) => {
    try {
      const csrfToken = cookies.csrftoken;
      const data = { score: gameState.scoreCounter };

      const response = await axios.post(`/score/${testId}/record/`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'X-CSRFToken': csrfToken
        }
      });
      const rd = response.data
      const message = rd.message;
      setRecordMessage(message);
      setShowModal(true);
      const newMaxScore = rd.maxscore
      setMaxScores((prevScores) => {
      
        const exists = prevScores.some(score => score.id === newMaxScore.id);
      
        if (!exists) {
          return [...prevScores, newMaxScore];
        }
      
        return prevScores.map(score =>
          score.id === newMaxScore.id && score.score < newMaxScore.score ? newMaxScore : score
        );
      });

      setCurrentUser((prevUser) => ({
        ...prevUser,
        total_english_5_score: rd.user_data.total_english_5_score,
        total_english_6_score: rd.user_data.total_english_6_score,
        total_phonics_score: rd.user_data.total_phonics_score,
        total_numbers_score: rd.user_data.total_numbers_score,
        total_eiken_score: rd.user_data.total_eiken_score,
        total_max_scores: rd.user_data.total_max_scores,
      }));
      const level = Math.floor((rd.user_data.total_eiken_score + rd.user_data.total_numbers_score + rd.user_data.total_phonics_score) / 50);
      setPetLevel(level)
      const user_level = Math.floor((rd.user_data.total_max_scores) / 50);
      setLvl(user_level)

    } catch (error) {
      console.error('Error recording test score:', error);
      setError('Failed to record test score.');
      setSignupModal(true);
    }
  };



  const toggleMemories = () => {
    setActiveMemories(prev => !prev);
    setActivity("test");
  };

  const toggleEikenMemories = () => {
    setActiveEikenMemories(prev => !prev);
    setActivity("test");
  };


  const toggleQuestionDetails = async (testId, testDescription, testDescriptionSound, numberOfQuestions, testName, category) => {

    dispatchGame({ type: 'RESET_GAME' });
    const filteredQuestions = testQuestions.questions.filter(question => (question.test === testId && !question.category) || (activeFinals && question.category === category))
    const oneQuestion = filteredQuestions[0];
    setQuestions(oneQuestion);

    if (oneQuestion && oneQuestion.question_list) {
      const keys = Object.keys(oneQuestion.question_list);
      const shuffled = shuffleArray([...keys]);
      dispatchGame({
        type: 'SET_SHUFFLED_KEYS',
        payload: shuffled,
      });
    }
    
    const randomizedValues = testQuestions.questions.reduce((acc, question) => {
      const keys = Object.keys(question.question_list);
      const shuffledKeys = shuffleArray([...keys]);

      const unusedKeys = keys.filter(key => !Object.values(acc).some(item => item.randomAlphabet === key));

      const randomKey = unusedKeys.length > 0
        ? unusedKeys[Math.floor(Math.random() * unusedKeys.length)]
        : keys[Math.floor(Math.random() * keys.length)];

      const randomValue = question.question_list[randomKey];


      let randomAlphabetSliced = null;
      if (question.first_letter) {
        randomAlphabetSliced = `_${randomKey.slice(1)}`;
      } else if (question.second_letter) {
        randomAlphabetSliced = `${randomKey[0]}_${randomKey.slice(2)}`;
      } else if (question.third_letter) {
        randomAlphabetSliced = `${randomKey.slice(0, 2)}_${randomKey.slice(3)}`;
      } else if (question.last_letter) {
        randomAlphabetSliced = `${randomKey.slice(0, randomKey.length - 1)}_`;
      }

      const isArray = Array.isArray(randomValue)
      const isArrayfour = Array.isArray(randomValue) && randomValue.length >= 4

      acc[question.duplicateId] = {
        randomAlphabetSliced : randomAlphabetSliced,
        randomAlphabet: randomKey || null,
        randomUrl: !isArray ? randomValue : null,
        randomTranslation: isArray ? randomValue[0] : null,
        randomEikenUrl: isArray ? randomValue[1] : null,
        randomWrongOne: isArrayfour ? randomValue[0] : null,
        randomWrongTwo: isArrayfour ? randomValue[1] : null,
        randomWrongThree: isArrayfour ? randomValue[2] : null,
        randomCorrect: isArrayfour ? randomValue[3] : null,
        randomNumbers: randomValue.numbers || null,
        randomWord: randomValue.word ? (Array.isArray(randomValue.word) ? randomValue.word[0] : randomValue.word) : randomValue.word || null,
        randomWord2: randomValue.word2 || null,
        randomJapanese: randomValue.japanese || null,
        randomPicture: randomValue.picture || null,
        randomSound: randomValue.sound || null,
        randomSound2: randomValue.sound2 || null,
        randomSound3: randomValue.sound3 || null,
        randomLabel: randomValue.label || null,
      };

      return acc;
    }, {});



    setRandomizedValues(randomizedValues);

    const randomizedOptions = testQuestions.questions.reduce((acc, question) => {
      const options = question.options;
      const shuffledOptions = shuffleArray([...options]);
      const optionKeys = Object.keys(question.question_list)
      const selectedKeys = new Set();

      const randomizedOptionsForQuestion = shuffledOptions.map((option) => {
        let randomOptionKey;
        do {
          randomOptionKey = optionKeys[Math.floor(Math.random() * optionKeys.length)];
        } while (randomOptionKey === randomizedValues[question.duplicateId].randomAlphabet || selectedKeys.has(randomOptionKey));

        selectedKeys.add(randomOptionKey);
        return { ...option, randomOptionKey };
      });

      acc[question.duplicateId] = randomizedOptionsForQuestion;
      return acc;
    }, {});

    setRandomizedOptions(randomizedOptions);


    if (isPractice) {
      if (activeTestDescription === testDescription && activeTestDescriptionSound === testDescriptionSound) {
        setActiveTestDescription('')
        setActiveTestDescriptionSound('')
      } else {
        setActiveTestDescription(testDescription)
        setActiveTestDescriptionSound(testDescriptionSound)
      }
    }
    if (activeTestId === testId) {
      setActiveTestId(null);
      setActiveTestName('');
    } else {
      try {
        setActiveTestId(testId);
        setActiveTestName(testName);
        if (isPractice) {
          await fetchQuestionsByTest(testId);
        } else {
          const questionArray = Object.values(testQuestions).flat();

          const testExists = questionArray.some(question => (question.test === testId && !question.category));
          const finalTestExists = questionArray.some(question => (question.category === category))

          if ((!testExists && !category) || (!finalTestExists && category)) {
            await fetchTestQuestionsAndOptions(testId, numberOfQuestions, category);
          } else if (category === activeCategory) {
            setTotalQuestions(testQuestions.questions.filter(question => (question.category === category)).length);
          } else {
            setTotalQuestions(testQuestions.questions.filter(question => (question.test === testId && !question.category)).length);
          }
        }
      } catch (error) {
        console.error('Error fetching test questions and options:', error);
        setError('Failed to fetch test questions and options.');
      }
    }
  };

  const toggleCategories = async (category) => {
    if (activeCategory === category) {
      setActiveCategory(null);
      setActivity("");
    } else {
      try {
        setActiveCategory(category);
        setActivity("test");
        
        const testsArray = Object.values(tests).flat();

        const categoryExists = testsArray.some(test => test.category === category);

        if (!categoryExists) {
            const fetchedTests = await fetchTestsByCategory(category);
        }
      try {
        if (maxScores.length === 0) {
          const scores = await fetchMaxScores(currentUser.id);

          if (scores) {
            setMaxScores(scores);
          } else {
            console.error('No scores found for category:', category);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      } catch (error) {
        console.error('Error fetching tests by category:', error);
        setError('Failed to fetch tests by category.');
      }
    }
  };

  const handlePracticeChange = (e) => {
    setIsPractice(e.target.checked);
  };

  const handleLanguageChange = (e) => {
    setIsEnglish(e.target.checked);
  };

  const handleSubmit = async (e, sound2, sound3, word2, questionId, question, optionId, randomAlphabet, randomAlphabetSliced, randomUrl, randomWrongOne, randomWrongTwo, randomWrongThree, randomCorrect, randomEikenUrl, randomTranslation, randomNumbers, randomWord, randomWord2, randomJapanese, randomPicture, randomSound, randomSound2, randomSound3, randomLabel, testId) => {
    e.preventDefault();

    setCorrectWord(randomNumbers ? randomNumbers : randomWord);
    setCorrectSound(sound3 ? randomSound3 : sound2 ? randomSound2 : randomSound !== null ? randomSound : randomEikenUrl !== 't' ? randomEikenUrl : randomUrl);
    setCorrectPicture(randomPicture);
    setCorrectLabel(word2 ? randomWord2 : randomLabel);
    setCorrectEikenWord(randomCorrect);


    setSelectedOption(null)
    setInputValue('');


    setShowModal(true);
    setCorrectAnswerKey(randomAlphabet);

    let audioUrl, audioElement;
    if (correctOption) {
      dispatchGame({
        type: 'INCREMENT_SCORE',
        payload: { testId },
      });    
      setIsCorrect(true);
      setCurrentWrongAudioIndex(0);
      audioUrl = currentCorrectAudioIndex >= 9
        ? (isEnglish ? correctEnglishAudioUrls[8] : correctAudioUrls[8])
        : (isEnglish ? correctEnglishAudioUrls[currentCorrectAudioIndex] : correctAudioUrls[currentCorrectAudioIndex]);
      audioElement = new Audio(audioUrl);
      setCurrentCorrectAudioIndex((prevIndex) => {
        const newIndex = (prevIndex + 1);
        return newIndex;
      });
    } else {
      setIsCorrect(false);
      setCurrentCorrectAudioIndex(0);
      audioUrl = (isEnglish ? wrongEnglishAudioUrls[currentWrongAudioIndex] : wrongAudioUrls[currentWrongAudioIndex]);
      audioElement = new Audio(audioUrl);
      setCurrentWrongAudioIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) < wrongAudioUrls.length ? (prevIndex + 1) : prevIndex;
        return newIndex;
      });
    }

    audioElement.volume = volume;
    audioElement.play();

    dispatchGame({
      type: 'SET_ACTIVE_QUESTION_INDEX',
      payload: gameState.activeQuestionIndex + 1,
    }); 
    if (gameState.activeQuestionIndex === 4 && activeFinals) {
      setQuestions(null);
    } 
  };

  const closeModal = () => {
    setShowModal(false);
    setRecordMessage('');
    if (gameState.activeQuestionIndex === totalQuestions && activeTestId !== null && !activeFinals) {
        recordScore(activeTestId);
        setActiveTestId(null);
        dispatchGame({ type: 'RESET_GAME' });
    }
    if (gameState.activeQuestionIndex === totalQuestions && activeFinals) {
      recordFinalsScores(activeCategory);
      setActiveFinals(false);
      setActiveTestId(null);
      dispatchGame({ type: 'RESET_GAME' });
    }
  };


  const handlePlay = (audioUrl, button) => {
      if (button.disabled) return;

      button.disabled = true;

      const audio = new Audio(audioUrl);
      audio.play();

      audio.onended = () => {
          button.disabled = false;
      };
  };

  const handleLeaveClassroom = async (userId, classroomId) => {
    try {
      const csrfToken = cookies.csrftoken;
      const response = await axios.post(
        `/remove/account/${userId}/`, { classroomId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'X-CSRFToken': csrfToken,
          },
        }
      );
      setCurrentUser((prevUser) => {
        if (!prevUser) return prevUser;
  
        const updatedUser = { ...prevUser };
  
        if (updatedUser.student) {
          const classrooms = updatedUser.student.classrooms.filter(c => c.id !== activeClassroomId);
  
          updatedUser.student = { 
            ...updatedUser.student, 
            classrooms
          };
        
          if (classrooms.length > 0) {
            setActiveClassroomId(classrooms[0].id);
            setActiveClassroomName(classrooms[0].name);
          } else {
            setActiveClassroomId(null);
            setActiveClassroomName("");
          }
        } else if (updatedUser.teacher) {
          const classrooms = updatedUser.teacher.classrooms.filter(c => c.id !== activeClassroomId);

          updatedUser.teacher = { 
            ...updatedUser.teacher, 
            classrooms 
          };
        
          if (classrooms.length > 0) {
            setActiveClassroomId(classrooms[0].id);
            setActiveClassroomName(classrooms[0].name);
          } else {
            setActiveClassroomId(null);
            setActiveClassroomName("");
          }
        }
  
        return updatedUser;
      });

    } catch (error) {
      console.error('Error deleting account:', error);
      alert('An error occurred while deleting the account.');
    }
  };





  const renderForm = (sound2, sound3, word2, question, randomAlphabet, randomAlphabetSliced, selectedKeys, randomUrl, randomWrongOne, randomWrongTwo, randomWrongThree, randomCorrect, randomEikenUrl, randomTranslation, randomNumbers, randomWord, randomWord2, randomJapanese, randomPicture, randomSound, randomSound2, randomSound3, randomLabel) => {
    const options = randomizedOptions[question.duplicateId];
    if (!options) return null;
    const optionId = options.length === 1 ? options[0].id : null;

    return (
      <form className="test-form"
      onSubmit={(e) => {
        if (selectedOption !== null || inputValue.trim() !== '') {
          handleSubmit(e, sound2, sound3, word2, question.id, question, optionId, randomAlphabet, randomAlphabetSliced, randomUrl, randomWrongOne, randomWrongTwo, randomWrongThree, randomCorrect, randomEikenUrl, randomTranslation, randomNumbers, randomWord, randomWord2, randomJapanese, randomPicture, randomSound, randomSound2, randomSound3, randomLabel, question.test);
        } else {
          e.preventDefault();
        }
      }}
      >
        <div className="container-fluid">
          <div className="row">
            {options.map(option => {
              return (
                <div key={option.id} className={!question.write_answer ? "col-md-6" : ""}>
                  {question.write_answer ? (
                    <>
                    {(question.first_letter || question.second_letter || question.third_letter || question.last_letter) ? (
                      <div>
                        <span style={{ fontSize: '50px' }}>{randomAlphabetSliced}</span>
                        <p>書いてある文字と足りない文字を全部書いて上の言葉を完成させてください</p>
                      </div>
                    ) : null}
                    {question.description && (
                      <h4>{question.name}</h4>
                    )}
                    <input
                      type="text"
                      id={`selected_option_${question.id}_${option.id}`}
                      name={`selected_option_${question.id}`}
                      style={{ width: '400px', height: '50px', marginTop: '20px' }}
                      value={inputValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        setInputValue(value);
                        if (!randomLabel && !question.word2 && value === randomAlphabet) {
                          setCorrectOption(true);
                        } else if (randomLabel && value === randomLabel) {
                          setCorrectOption(true);
                        } else if (question.word2 && value === randomWord2 ) {
                          setCorrectOption(true);
                        } else {
                          setCorrectOption(false);
                        }
                      }}
                    />
                    </>
                  ) : (
                    <>
                      {question.question_list[option.randomOptionKey]?.picture && !question.label ? (
                        <img
                          style={{ width: '150px', height: '120px', marginTop: '8px', border: '3px solid black' }}
                          src={option.is_correct ? randomPicture : question.question_list[option.randomOptionKey].picture}
                          alt="Option"
                        />
                      ): null}
                      <label htmlFor={`selected_option_${question.id}_${option.id}`}   style={{ fontSize: '25px', marginBottom: '10px'}}>
                        <input
                          type="radio"
                          id={`selected_option_${question.id}_${option.id}`}
                          name={`selected_option_${question.id}`}
                          value={option.id}
                          style={{ height: '25px', width: '25px', marginRight: '10px', flexShrink: 0 }}
                          onChange={() => {
                            setCorrectOption(option.is_correct);
                            setSelectedOption(option.id);
                          }}
                          checked={selectedOption === option.id}
                        />
                        <span style={{ flex: 1 }} onClick={(e) => randomEikenUrl && !randomWrongThree && !question.no_sound ? handlePlay(option.is_correct ? randomEikenUrl : questions.question_list[option.randomOptionKey][1], e.target) : null}>
                        {(question.question_list[option.randomOptionKey]?.word === undefined && !randomPicture) ? (
                          option.is_correct ? (randomCorrect ? randomCorrect : randomAlphabet) : randomWrongThree ? (option.id == question.options[1].id ? randomWrongOne : option.id == question.options[2].id ? randomWrongTwo : randomWrongThree) : option.randomOptionKey ? option.randomOptionKey : option.name
                        ): (question.question_list[option.randomOptionKey]?.word !== undefined && !randomPicture ? (option.is_correct ? (randomNumbers !== undefined ? randomNumbers : randomWord) : (randomNumbers !== undefined ? question.question_list[option.randomOptionKey].numbers : question.question_list[option.randomOptionKey].word)) : null
                        )}
                        {question.japanese_option && (
                          option.is_correct? randomJapanese : question.question_list[option.randomOptionKey]?.japanese
                        )}
                        </span>
                      </label>
                      {question.question_list[option.randomOptionKey].word && randomPicture ? (
                        <h4>{question.label ? (option.is_correct? randomLabel : (question.question_list[option.randomOptionKey].label === randomLabel) ? "1000 Yen" : question.question_list[option.randomOptionKey].label) : option.is_correct ? randomWord : question.question_list[option.randomOptionKey].word}</h4>
                      ): null}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <button
          id="submit-btn"
          type="submit"
          className="btn btn-primary"
          style={{
            border: '4px solid #343a40',
            width: '400px',
            height: '80px',
            marginTop: '20px'
          }}
        >
          {isEnglish ? "Answer" : "回答する"}
        </button>
      </form>
    );
  };


  return (
    <div>
      <div className="flex-center-column">
      {!activeCategory && !activeMemories && !activeEikenMemories && (
      <figure style={{ margin: 0 }}>
      {currentUser?.student && (
                <h1 style={{ fontWeight: 'bold' }}>{currentUser.username}</h1>
      )}
      <img
                src={currentUser ? currentUser.profile_asset?.[lvl]?.image : "https://storage.googleapis.com/profile_assets/a-crying.jpeg"}
                alt="Level Image"
                className="profile_pic"
                onClick={() => document.getElementById('audio').play()}
      />
      <img
                src={currentUser ? currentUser?.pets?.[petLevel]?.image : 'https://storage.googleapis.com/profile_pets/one_cell.png'}
                alt="Level Image"
                style={{ height: '150px', width: '150px', border: '5px solid black' }}
                onClick={() => document.getElementById('pet_audio').play()}
      />
      <figcaption className="profile-text-style">
            {petLevel}{isEnglish ? 'you ' : '君は'}{isEnglish ? (currentUser ? currentUser?.profile_asset?.[lvl]?.english_text : "are a baby that can do nothing but cry") : (currentUser ? currentUser?.profile_asset?.[lvl]?.text: "泣くことしかできない生まれたての赤ちゃんです")}
      </figcaption>
      <figcaption className="profile-text-style">
            {isEnglish ? 'your pet is ' : '君のペットは'}{isEnglish ? (currentUser ? currentUser?.pets?.[petLevel]?.english_text : 'still only a one celled organism') : (currentUser ? currentUser?.pets?.[petLevel]?.text : 'まだ細胞一つしかない生物')}
      </figcaption>
      <figcaption className="profile-text-style">
                <strong>{isEnglish ? 'Total max scores=' : '（英検以外）最大記録トータル＝'}{currentUser ? currentUser?.total_max_scores : 0}    {isEnglish ? 'points untill growth=' : '成長まで＝'} {50 - (currentUser ? currentUser?.total_max_scores % 50 : 0)}{isEnglish ? 'points' : '点'}</strong>
      </figcaption>
      <figcaption className="profile-text-style">
                <strong>{isEnglish ? 'Total Eiken score=' : '（英検フォニックス数字）最大記録トータル＝'}{currentUser ? (currentUser?.total_eiken_score + currentUser?.total_numbers_score + currentUser.total_phonics_score) : 0}    {isEnglish ? 'points untill evolution=' : '進化まで＝'} {50 - (currentUser ? (currentUser?.total_eiken_score + currentUser?.total_numbers_score + currentUser?.total_phonics_score) % 50 : 0)}{isEnglish ? 'points' : '点'}</strong>
      </figcaption>
      {!activeCharacterVoiceMute ? (<audio id="audio" src={currentUser ? (isEnglish ? currentUser?.profile_asset?.[lvl]?.english_audio : currentUser?.profile_asset?.[lvl]?.audio) : "https://storage.googleapis.com/profile_assets/2024_10_28_13_01_19_1.mp3"} />) : (null)}
      {!activeCharacterVoiceMute ? (<audio id="pet_audio" src={currentUser ? currentUser?.pets?.[petLevel]?.audio : 'https://storage.googleapis.com/profile_pets/2024_12_23_12_14_25_1.mp3'} />) : (null)}
      </figure>
      )}
        <div>
        <div className="quiz-header flex-center-column">
          <div>
          {!activeEikenMemories && (
          <button
            onClick={() => toggleMemories()}
            className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
            style={{ height: !activeMemories ? '100px' : '50px', width: !activeMemories ? '220px' : '290px', padding: '10px', border: '5px solid black' }}
          ><span className={`text-white ${activeMemories ? 'text_shadow' : ''}`}>{!activeMemories ? (isEnglish ? 'Memories' : '思い出を見る') : (isEnglish ? 'Go back' : '戻る！')}</span></button>
          )}
          {!activeMemories && (
          <button
            onClick={() => toggleEikenMemories()}
            className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
            style={{ height: !activeEikenMemories ? '100px' : '50px', width: !activeEikenMemories ? '220px' : '290px', padding: '10px', border: '5px solid black' }}
          ><span className={`text-white ${activeEikenMemories ? 'text_shadow' : ''}`}>{!activeEikenMemories ? (isEnglish ? 'Pet memories' : 'ペットの思い出を見る') : (isEnglish ? 'Go back' : '戻る！')}</span></button>
          )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {activeMemories && (
            Object.keys(currentUser?.memories || {}).map((key) => (
              <span key={key}>
                <img
                  src={currentUser?.memories[key].image}
                  alt={`Level ${key} Image`}
                  className="profile_pic"
                  onClick={() => document.getElementById(`audio-${key}`).play()}
                />
                {!activeCharacterVoiceMute ? (<audio id={`audio-${key}`} src={isEnglish ? currentUser?.memories[key].english_audio : currentUser?.memories[key].audio} />) : (null)}
              </span>
            ))
          )}
          {activeEikenMemories && (
            Object.keys(currentUser?.eiken_memories || {}).map((key) => (
              <span key={key}>
                <img
                  src={currentUser?.eiken_memories[key].image}
                  alt={`Level ${key} Image`}
                  className="profile_pic"
                  onClick={() => document.getElementById(`audio-${key}`).play()}
                />
                {!activeCharacterVoiceMute ? (<audio id={`audio-${key}`} src={isEnglish ? currentUser?.eiken_memories[key].audio : currentUser?.eiken_memories[key].audio} />) : (null)}
              </span>
            ))
          )}
          </div>
          {!activeMemories && !activeEikenMemories && (
          <>
          <span>
          <button
            onClick={() => toggleCategories('english_5')}
            className={`btn btn-success mb-3 category_button ${activeCategory === null ? 'active' : 'd-none'}`}
          >{isEnglish? '5th grade English' : '５年英語'}<h5 className="text-white">{isEnglish ? 'Total Score:' : 'トータル：'}{currentUser?.total_english_5_score}/{currentUser?.question_counts.total_english_5_questions}</h5></button>
          <button
            onClick={() => toggleCategories('english_6')}
            className={`btn btn-success mb-3 category_button ${activeCategory === null ? 'active' : 'd-none'}`}
          >{isEnglish ? '6th grade English' : '６年英語'}<h5 className="text-white">{isEnglish ? 'Total Score:' : 'トータル：'}{currentUser?.total_english_6_score}/{currentUser?.question_counts.total_english_6_questions}</h5></button>
          <button
            onClick={() => toggleCategories('phonics')}
            className={`btn btn-success mb-3 category_button ${activeCategory === null ? 'active' : 'd-none'}`}
          >{isEnglish ? 'Alphabet and phonics' : 'アルファベットとフォニックス'}<h5 className="text-white">{isEnglish ? 'Total Score:' : 'トータル：'}{currentUser?.total_phonics_score}/{currentUser?.question_counts.total_phonics_questions}</h5></button>
          <button
            onClick={() => toggleCategories('numbers')}
            className={`btn btn-success mb-3 category_button ${activeCategory === null ? 'active' : 'd-none'}`}
          >{isEnglish ? 'Numbers/days/months' : '数字/曜日/月'}<h5 className="text-white">{isEnglish ? 'Total Score:' : 'トータル：'}{currentUser?.total_numbers_score}/{currentUser?.question_counts.total_numbers_questions}</h5></button>
          <button
            onClick={() => toggleCategories('eiken')}
            className={`btn btn-success mb-3 category_button ${activeCategory === null ? 'active' : 'd-none'}`}
          >{isEnglish? 'Eiken' : '英検'}<h5 className="text-white">{isEnglish ? 'Total Score:' : 'トータル：'}{currentUser?.total_eiken_score}/{currentUser?.question_counts.total_eiken_questions}</h5></button>
          <button
            className={`btn btn-success mb-3 ${activeCategory !== null && activeTestId === null ? 'active' : 'd-none'}`}
            style={{ height: '50px', width: '290px', padding: '10px', border: '5px solid black', position: 'relative', marginBottom: '10px' }}
            onClick={() => toggleCategories(activeCategory)}
          >
            <span
              className="text-center text-white text_shadow"
            >
            <FaArrowLeft style={{ marginRight: '10px' }} /> {isEnglish ? 'Go back!' : '戻る！'}
            </span>
          </button>
          </span>
          {activeCategory === 'eiken' ? <h4>最大２５点の語彙テスト以外７割以上とれたら次のテストが現れる</h4> : ''}
          </>
          )}
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
                <div className="test-buttons-container" style={{ display: !activeTestId ? 'flex' : undefined, flexWrap: !activeTestId ? 'wrap' : undefined }}>
                {activeCategory && !activeFinals && activeTestId === null && activeCategory !== "eiken" &&
                <button
                        className="btn btn-success test_buttons"
                        onClick={() => {
                          setActiveFinals((prev) => prev === false ? true : false);
                          toggleQuestionDetails(undefined, undefined, undefined, undefined, undefined, activeCategory);
                        }}
                      >
                        <span
                          className="text-center text-white text_shadow" style={{ fontSize: '15px' }}
                        >
                          まとめテスト
                        </span>
                          <img src={'https://storage.googleapis.com/grade5_lesson8/ivar.jpg'} alt="Question" width="170" height="170" />
                </button>
                }
                {activeFinals &&
                <button
                          className="btn btn-warning"
                          style={{ height: '50px', width: '400px', border: '5px solid black', marginBottom: '20px' }}
                          onClick={openModal}
                        >
                          <span
                            className="text-center text-white text_shadow"
                          >
                          <FaArrowLeft style={{ marginRight: '10px' }} /> {gameState.activeQuestionIndex !== 0 ? (isEnglish ? 'Record score and ' : '点数記録して') : ''}{isEnglish ? 'Go back from ' : ''}まとめてスト{!isEnglish ? 'から戻る!' : ''}
                          </span>
                </button>
                }
                {Object.values(tests)
                .flat()
                .sort((a, b) => a.lesson_number - b.lesson_number)
                .filter((test) => {
                  if (test.category !== 'eiken' || test.lesson_number === 1) {
                    return true;
                  }
              
                  const previousTest = Object.values(tests)
                    .flat()
                    .find(t => t.category === "eiken" && t.lesson_number === test.lesson_number - 1);
              
                  if (!previousTest) {
                    return false;
                  }
              
                  const previousMaxScore = maxScores.find(maxScore => maxScore.test === previousTest.id);
              
                  if (!previousMaxScore) {
                    return false;
                  }
              
                  return previousMaxScore.score / previousTest.total_score >= 0.7;
                })
                .map(test => (
                    <span key={test.id}>
                    {activeTestId !== null ? (
                        <>
                        <button
                          className={`btn btn-warning ${activeTestId === test.id || activeTestId === null ? 'active' : 'd-none'}`}
                          style={{ height: '50px', width: '400px', border: '5px solid black', marginBottom: '20px' }}
                          onClick={openModal}
                        >
                          <span
                            className="text-center text-white text_shadow"
                          >
                          <FaArrowLeft style={{ marginRight: '10px' }} /> {gameState.activeQuestionIndex !== 0 ? (isEnglish ? 'Record score and ' : '点数記録して') : ''}{isEnglish ? 'Go back from ' : ''}{test.name}{!isEnglish ? 'から戻る!' : ''}
                          </span>
                        </button>
                        </>
                    ) : (
                      <button
                        className={`btn btn-warning test_buttons ${activeCategory === test.category && activeTestId === null ? 'active' : 'd-none'}`}
                        onClick={() => toggleQuestionDetails(test.id, test.description, test.sound_url, test.number_of_questions, test.name)}
                      >
                        <span
                          className="text-center text-white text_shadow" style={{ fontSize: '15px' }}
                        >
                          {test.name}
                        </span>
                        {test.picture_url && (
                          <img src={test.picture_url} alt="Question" width="170" height="170" />
                        )}
                        <div>
                            {maxScores.some(maxScore => maxScore.test === test.id)
                              ? maxScores.map(maxScore =>
                                  maxScore.test === test.id ? (
                                    <h5 key={maxScore.id} className="text-white">
                                      {isEnglish ? "High score: " : "最高記録："}{maxScore.score}/{test.total_score}
                                    </h5>
                                  ) : null
                                )
                              : <h5 className="text-white">{isEnglish ? "Still " : "まだ"}0/{test.total_score}</h5>
                            }
                        </div>
                      </button>
                    )}
                    </span>
                ))}
                {activeTestId !== null && (
                  <>
                  <div>
                      {activeTestDescription.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                      {activeTestDescriptionSound ? (<audio controls> <source src={activeTestDescriptionSound} type="audio/mpeg" /> Your browser does not support the audio element. </audio>) : null}
                  </div>
                  <div className="test-details flex-center-column" >
                  {isPractice && questions && ((activeCategory === 'eiken' && activeTestName.includes('英検語彙')) || activeCategory !== 'eiken') && (
                    <div key={questions.id} style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {(() => {
                        const keys = Object.keys(questions.question_list);

                        return keys.map((key) => {
                          const value = questions.question_list[key];

                          return (
                            <div key={key} style={value.picture ? { margin: '10px' } : { flex: '1 1 50%', padding: '10px' }}>
                            <button
                              className="btn btn-info"
                              style={{ height: value.picture ? '170px' : '70px', width: value.picture ? '170px' : 'auto', padding: '10px', border: '5px solid black', position: 'relative', backgroundColor: 'lightblue' }}
                              onClick={(e) => handlePlay(value[1] !== 't' && value[1] !== undefined ? value[1] : questions.sound3? value.sound3 : questions.sound2 ? value.sound2 : value.sound ? value.sound : value, e.target)}
                              disabled={isPlayDisabled}
                            >
                              {((value.picture && value.word) || (!value.picture && !value.word)) && (
                              <span
                                className={`${value.picture ? 'text-center text-with-picture' : 'text-without-picture'} text-white`}
                              >
                                {value.numbers ? value.numbers : value.label ? value.label : value.word ? value.word : key}{value[0] !== undefined && value[0] !== 'h'  ? ` = ${value[0]}` : ""}
                              </span>
                              )}
                              {!value.picture && value.word && (
                              <span
                                className={`${value.picture ? 'text-center text-with-picture' : 'text-without-picture'} text-white`}
                              >
                                {value.numbers ? value.numbers : ''}{value.word}
                              </span>
                              )}
                              {value.picture ? <img src={value.picture} alt={`Picture of ${value.word || key}`} width="120" height="120" /> : null}
                            </button>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                  {!isPractice && questions && questions.sound3 && (
                    <div key={questions.id} style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {(() => {
                        const keys = Object.keys(questions.question_list);

                        return gameState.shuffledKeys.map((key) => {
                          const value = questions.question_list[key];
                          return (
                            <div key={key}>
                              <div
                                className={`${value.picture ? 'text-center' : ''} text-white`}
                                style={!value.picture ? { fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' } : { background: 'rgba(0, 0, 0, 0.5)', padding: '5px', borderRadius: '5px', justifyContent: 'center', fontSize: '15px', lineHeight: '1' }}
                              >
                                {value.label ? value.label : value.word ? value.word : key}
                              </div>
                              {value.picture ? <img src={value.picture} alt={`Picture of ${value.word || key}`} width="100" height="100" /> : null}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                    <ul>
                      {!isPractice && testQuestions.questions
                      .filter(question => question.test === activeTestId && !question.category || (activeFinals && question.category === activeCategory))
                      .sort((a, b) => (b.sound3 ? 1 : 0) - (a.sound3 ? 1 : 0))
                      .map((question, index) => {
                        const { randomAlphabetSliced, randomAlphabet, randomUrl, randomWrongOne, randomWrongTwo, randomWrongThree, randomCorrect, randomEikenUrl, randomTranslation, randomNumbers, randomWord, randomWord2, randomJapanese, randomPicture, randomSound, randomSound2, randomSound3, randomLabel} = randomizedValues[question.duplicateId] || {};
                        let selectedKeys = [];
                        const isAudio = typeof randomUrl === 'string' && (randomUrl.includes('Record') || randomUrl.includes('mp3'));
                        const isPicture = typeof randomUrl === 'string' && randomUrl.includes('image');
                        const sound2 = question.sound2
                        const sound3 = question.sound3
                        const word2 = question.word2
                        const keys = Object.keys(question.question_list);
                        const shuffledKeys = shuffleArray([...keys]);
                        const shuffledValues = shuffledKeys.map((key) => question.question_list[key]);
                        return (
                          <>
                          <div key={question.id} className={index === gameState.activeQuestionIndex ? 'active' : 'd-none'}>
                            {!sound3 ? (
                              isPicture ? (
                                <img src={randomUrl} alt="Question" width="200" height="150" />
                              ) : question.label ? (
                                <>
                                  <img src={randomPicture} alt="Question" width="200" height="150" />
                                  <h5>{randomWord}</h5>
                                  <button
                                    className="play_buttons btn btn-success mb-3"
                                    style={{ border: '5px solid black' }}
                                    onClick={(e) => handlePlay(randomSound2, e.target)}
                                    disabled={isPlayDisabled}
                                  >
                                    {isEnglish ? "Play sound" : "音声"} <FaPlay style={{ marginLeft: '10px' }} />
                                  </button>
                                </>
                              ) : isAudio ? (
                                <button
                                  className="play_buttons btn btn-success mb-3"
                                  style={{ border: '5px solid black' }}
                                  onClick={(e) => handlePlay(randomUrl, e.target)}
                                  disabled={isPlayDisabled}
                                >
                                  {isEnglish ? "Play sound" : "音声"} <FaPlay style={{ marginLeft: '10px' }} />
                                </button>
                              ) : randomSound ? (
                                <button
                                  className="play_buttons btn btn-success mb-3"
                                  style={{ border: '5px solid black' }}
                                  onClick={(e) => handlePlay(sound2 ? randomSound2 : randomSound, e.target)}
                                  disabled={isPlayDisabled}
                                >
                                  {isEnglish ? "Play sound" : "音声"} <FaPlay style={{ marginLeft: '10px' }} />
                                </button>
                              ) : (
                                <p style={{ fontSize: '50px' }}>{randomUrl}</p>
                              )
                            ) : null}
                            <h4 style={{ whiteSpace: 'pre' }}>{randomCorrect ? formatText(randomAlphabet) : randomTranslation}</h4>
                            {sound3 && (
                              <button
                                className="play_buttons btn btn-success mb-3"
                                style={{ border: '5px solid black' }}
                                onClick={(e) => handlePlay(sound3 ? randomSound3 : sound2 ? randomSound2 : randomSound, e.target)}
                                disabled={isPlayDisabled}
                              >
                                {isEnglish ? "Play sound" : "音声"} <FaPlay style={{ marginLeft: '10px' }} />
                              </button>
                            )}
                            {randomNumbers && (
                            <h4>{randomWord}</h4>
                            )}
                            {question.japanese_option && (
                              <h4>{randomWord}</h4>
                            )}
                            {question.description && !question.write_answer && (
                              <h4>{question.name}</h4>
                            )}
                            {renderForm(sound2, sound3, word2, question, randomAlphabet, randomAlphabetSliced, selectedKeys, randomUrl, randomWrongOne, randomWrongTwo, randomWrongThree, randomCorrect, randomEikenUrl, randomTranslation, randomNumbers, randomWord, randomWord2, randomJapanese, randomPicture, randomSound, randomSound2, randomSound3, randomLabel)}
                          </div>
                          </>
                        );
                      })}
                    </ul>
                  </div>
                  </>
                )}
                </div>
        </div>
          <div className="volume-control">
            <label htmlFor="volume-slider" style={{ fontSize: '20px' }}>
              {isEnglish ? "Adjust Ivar's reaction voice volume" : "イバルの反応の声音量調整"}
            </label>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ width: '200px' }}
            />
          </div>
          <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div className={`${activeTestId === null ? 'active' : 'd-none'}`}>
            <span className='size-20-20'>{isEnglish ? 'Practice' : '練習'} ：</span>
            <input
              type="checkbox"
              className='size-20-20'
              checked={isPractice}
              onChange={handlePracticeChange}
            />
          </div>
          <div className={`${activeTestId === null ? 'active' : 'd-none'}`}>
            <span className='size-20-20'>{isEnglish ? '英語' : 'English'}：</span>
            <input
              type="checkbox"
              className='size-20-20'
              checked={isEnglish}
              onChange={handleLanguageChange}
            />
          </div>
          </span>
          {activity === "" &&
          <div style={{ marginBottom: '25px', marginTop: '25px' }}>
          <div>
            {message && (
              <div
              style={{
                color: message.type === "success" ? "#32CD32" : "#FF4500",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                padding: "10px",
                borderRadius: "5px",
                fontWeight: "bold",
                fontSize: "20px", 
                marginBottom: "10px",
              }}
              >
                {message.text}
              </div>
            )}
            {currentUser?.teacher &&
            <form onSubmit={handleClassroomCreateSubmit}>
              <input
                type="text"
                placeholder="教室名入力して"
                value={createdClassroomName}
                onChange={(e) => setCreatedClassroomName(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary submit_buttons" style={{ marginLeft: "10px", border: '5px solid black' }}>教室にを作る</button>
            </form>
            }
            <form onSubmit={handleJoinSubmit}>
              <input
                type="text"
                placeholder="教室名入力して"
                value={joinedClassroomName}
                onChange={(e) => setJoinedClassroomName(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary submit_buttons" style={{ marginLeft: "10px", border: '5px solid black' }}>教室に入る</button>
            </form>
            <div>
            <span style={{ display: 'flex', justifyContent: 'center' }}>
                <label style={{ width: '20px', height: '20px', whiteSpace: 'nowrap' }}>教室：</label>
                <select
                  style={{ width: "150px", height: "30px", marginLeft: '25px' }}
                  className="form-select"
                  value={activeClassroomName}
                  onChange={(e) => {
                    const selectedClassroom = userClassrooms.find(c => c.name === e.target.value);
                    if (selectedClassroom) {
                      setActiveClassroomId(selectedClassroom.id);
                      setActiveClassroomName(selectedClassroom.name);
                    }
                  }}
                >
                  {userClassrooms.map(classroom => (
                    <option key={classroom.id} value={classroom.name}>
                      {classroom.name}
                    </option>
                  ))}
                </select>
                <button className="btn btn-danger submit_buttons" style={{ marginLeft: '10px', border: '5px solid black' }} onClick={() => openLeaveModal()}>
                    <span className={`text-center`}>教室から抜ける</span>
                </button>
            </span>
            </div>
            {currentUser?.student &&
            <div style={{ border: "2px solid black", padding: "15px", borderRadius: "10px", backgroundColor: "#000", color: "#fff", maxWidth: "400px", margin: "20px auto", textAlign: "center" }}>
            <h2>{currentUser?.username}</h2>
            <h4>名字：{currentUser?.last_name}</h4>
            <h4>出席番号：{currentUser?.student?.student_number}</h4>
            <form onSubmit={handleUpdateProfile}>
              <input
                type="number"
                placeholder="出席番号変更"
                value={changedStudentNumber}
                onChange={(e) => setChangedStudentNumber(e.target.value)}
              />
              <input
                type="text"
                placeholder="名字変更"
                value={changedLastName}
                onChange={(e) => setChangedLastName(e.target.value)}
              />
              <button type="submit" className="btn btn-primary submit_buttons" style={{ marginLeft: "10px", border: '5px solid black' }}>名字番号変更</button>
            </form>
            </div>
            }
          </div>
          </div>
          }
        </div>
    </div>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header
          style={{
            backgroundImage:
                currentCorrectAudioIndex >= 9 || recordMessage
                ? `url("https://storage.googleapis.com/ivar_reactions/WhatsApp画像%202024-02-14%2013.27.37_9343389c%20(3).jpg")`
                : currentCorrectAudioIndex === 1 || currentCorrectAudioIndex === 2 || currentCorrectAudioIndex === 3
                ? `url("https://storage.googleapis.com/ivar_reactions/openart-5eda95374c2140e3a6dad00334c41fef_raw%20(3).jpg")`
                : currentCorrectAudioIndex === 4
                ? `url("https://storage.googleapis.com/ivar_reactions/openart-12ba3e00450f41cc899c83c6a484c79f_raw%20(4).jpg")`
                : currentWrongAudioIndex
                ? `url("https://storage.googleapis.com/ivar_reactions/openart-6cf0de3a89b84f87983d9234bf1fa9d5_raw%20(2).jpg")`
                : `url("https://storage.googleapis.com/ivar_reactions/openart-42849cd925af4fdba5bc73bf93394019_raw%20(7).jpg")`,


            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            height: '40vh'
          }}
        >
        </Modal.Header>
        <Modal.Body>
            {recordMessage ? (
                <div className="d-flex align-items-center justify-content-center">
                    <h2 className="message">{recordMessage}</h2>
                </div>
            ) : (
                <>
                <div className="d-flex align-items-center">
                    {isCorrect === true ? (
                        <>
                            <span style={{ fontSize: '50px' }}>{isEnglish ? "Correct!" : "正解！"}</span>
                            <span className="text-success" style={{ fontSize: '50px' }}>&#x2713;</span>
                        </>
                    ) : isCorrect === false ? (
                        <div>
                            <span style={{ fontSize: '50px' }}>{isEnglish ? "Naive!" : "あまい！"}</span>
                            <span className="text-danger" style={{ fontSize: '50px' }}>&#x2717;</span>
                            {correctSound && (
                              <p>
                                <button
                                    className="play_buttons btn btn-success mb-3"
                                    style={{ border: '5px solid black' }}
                                    onClick={(e) => handlePlay(correctSound, e.target)}
                                    disabled={isPlayDisabled}
                                >
                                    {isEnglish ? "Play sound" : "音声"} <FaPlay style={{ marginLeft: '10px' }} />
                                </button>
                              </p>
                            )}
                            <pre>{JSON.stringify(gameState.testScores, null, 2)}</pre>
                            <p>{totalQuestions}{gameState.activeQuestionIndex}</p>
                            <h1>{isEnglish ? "Correct answer:" : "正解は："}{correctLabel !== null ? correctLabel : correctWord !== null ? correctWord : correctEikenWord ? correctEikenWord : correctAnswerKey}</h1>
                        </div>
                    ) : null}
                </div>
                <h1>{isEnglish ? "Correct streak: " : "連続正解："}{currentCorrectAudioIndex}</h1>
                {isCorrect? <h1>{isEnglish ? "Points: " : "点数："}{gameState.scoreCounter}</h1> : null}
                </>
            )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Next!
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={modalIsOpen} onHide={closeReturnModal}>
        <Modal.Body>
          <p>まだテスト終わっていない。終わっていないまま戻ったら今までの点数しか記録されない。それでももどる？</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeReturnModal}>いいえ</Button>
          <Button variant="primary" onClick={handleBackClick}>はい</Button>
        </Modal.Footer>
      </Modal>
      <Modal show={signupModal} onHide={closeSignupModal}>
        <Modal.Body>
          <h4>登録してないかログインしていない</h4>
          <a href="https://eibaru.jp/signup/student" style={{ width: '200px', border: '4px solid black', display: 'inline-block', padding: '6px 12px', textAlign: 'center', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }} className="btn btn-success" rel="noopener noreferrer">
            生徒登録
          </a>
          <p>普通に練習だけするなら生徒登録がいい</p>
          <a href="https://eibaru.jp/signup/teacher/" style={{ width: '200px', border: '4px solid black', display: 'inline-block', padding: '6px 12px', textAlign: 'center', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }} className="btn btn-success" rel="noopener noreferrer">
            先生登録
          </a>
          <p>教室作って、そこに生徒を管理したいなら先生登録</p>
          <a href="https://eibaru.jp/accounts/login" style={{ width: '200px', border: '4px solid black', display: 'inline-block', padding: '6px 12px', textAlign: 'center', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }} className="btn btn-primary" rel="noopener noreferrer">
            ログイン
          </a>
          <h5>ログインしたら点数記録できるよ</h5>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeSignupModal}>いいえ</Button>
        </Modal.Footer>
      </Modal>
      <Modal show={leaveModal} onHide={closeLeaveModal}>
        <Modal.Body>
          <p>この生徒を本当に教室から追い出すんですか？</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeLeaveModal}>いいえ</Button>
          <Button variant="primary" onClick={handleLeave}>はい</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Test;