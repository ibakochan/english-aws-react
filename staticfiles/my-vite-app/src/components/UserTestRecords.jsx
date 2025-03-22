import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Button, Form, Modal } from 'react-bootstrap';
import { useUser } from "../context/UserContext";
import { FaPlay, FaArrowLeft } from 'react-icons/fa';


const UserTestRecords = () => {
  const { currentUser, activeClassroomId, activeClassroomName, setActiveClassroomId, userClassrooms, setActiveClassroomName, activity, setActivity, isEnglish, setIsEnglish } = useUser();
  const [activatedClassroomId, setActivatedClassroomId] = useState(null);
  const [activeUserManagement, setActiveUserManagement] = useState(null);
  const [activeRequests, setActiveRequests] = useState(false);
  const [classroomRequests, setClassroomRequests] = useState([]); 
  const [tests, setTests] = useState([]);
  const [users, setUsers] = useState([]);
  const [cookies, setCookie, removeCookie] = useCookies(['csrftoken']);
  const [maxScores, setMaxScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTestId, setActiveTestId] = useState(null);
  const [activeUserDeleteId, setActiveUserDeleteId] = useState(null);
  const [activeUserId, setActiveUserId] = useState(null);
  const [userDetailButtonActive, setUserDetailButtonActive] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [acceptMessage, setAcceptMessage] = useState(null);




  const openModal = (userId) => {
    setActiveUserDeleteId(userId);
    setModalIsOpen(true);
  };

  const closeReturnModal = () => {
    setModalIsOpen(false);
    setActiveUserDeleteId(null);
  };

  const handleBackClick = () => {
    closeReturnModal();
    handleAccountRemove(activeUserDeleteId, activeClassroomId);
  };


  const fetchClassroomRequests = async () => {
        try {
            const response = await axios.get(`/api/classroomrequest/by-classroom/${activeClassroomId}/`);
            setClassroomRequests(response.data);
        } catch (error) {
            console.error('Error fetching classroom requests:', error);
        }
  };

  const toggleAccept = async (requestId, unchangeable) => {
    try {
      const csrfToken = cookies.csrftoken;
      const response = await axios.post(`/classroom_accept/${requestId}/`, { unchangeable }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'X-CSRFToken': csrfToken
        }
      });
      const { status, success } = response.data;
      setAcceptMessage(status)
      setClassroomRequests(prevRequests =>
          prevRequests.map(request =>
              request.id === requestId ? { ...request, is_accepted: !request.is_accepted } : request
          )
      );

    } catch (error) {
      console.error('Error deleting submissions:', error);
      setError('失敗しました');
    }
  };

  const handleAccountRemove = async (userId, classroomId) => {
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

      setUsers(prevUsers =>
          prevUsers.filter(user => user.id !== userId)
      );

    } catch (error) {
      console.error('Error deleting account:', error);
      alert('An error occurred while deleting the account.');
    }
  };



  const fetchTestsByCategory = async (category) => {
    try {
      const response = await axios.get(`/api/name-id-tests/by-category/?category=${category}`);
        setTests(prevTests => ({
          ...prevTests,
          [`category_${category}`]: response.data,
        }));
    } catch (error) {
      console.error(`Error fetching tests for category ${category}:`, error);
    }
  };

  const toggleCategories = async (category) => {
    if (activeCategory === category) {
      setActiveCategory(null);
    } else {
      try {
        setActiveCategory(category);
        await fetchTestsByCategory(category);
      } catch (error) {
        console.error('Error fetching tests by category:', error);
        setError('Failed to fetch tests by category.');
      }
    }
  };

  const fetchUsers = async (classroomId, userId) => {
    try {
      setLoading(true);
      setError(null);
      const usersResponse = await axios.get(`/api/users/by-classroom/${classroomId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      const sortedUsers = usersResponse.data.sort((a, b) => {
        const numA = a.student?.student_number || '0000';
        const numB = b.student?.student_number || '0000';
        return numA.localeCompare(numB, undefined, { numeric: true });
      });

      console.log('Fetched users:', sortedUsers);
      setUsers(sortedUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users.');
      setLoading(false);
    }
  };





  const toggleUserDetailsForUserDetailButton = async (classroomId) => {
    if (userDetailButtonActive) {
      setUserDetailButtonActive(null);
      setUsers([]);
      setActiveUserManagement()
      setActivity("")
    } else {
      setActiveUserManagement(classroomId);
      setActivity("user_records")
      setUserDetailButtonActive(classroomId);
      await fetchUsers(classroomId);
    }
  };


  const fetchMaxScores = async (testId) => {
    try {
      setError(null);
      const maxScoresResponse = await axios.get(`/api/maxscore/by-classroom_and_test/${testId}/`);
      console.log('Fetched sessions:', maxScoresResponse.data);
      return maxScoresResponse.data;
    } catch (error) {
      console.error('Error fetching maxScores:', error);
      setError('Failed to fetch maxScores.');
    }
  };


  const toggleClassroomDetails = async (classroomId) => {
    if (activatedClassroomId === classroomId) {
      setActivity("")
      setActivatedClassroomId(null);
      setTests([]);
      setUsers([]);
    } else {
      setActivity("user_records")
      setActivatedClassroomId(classroomId);
      await fetchUsers(classroomId);
    }
  };

  const toggleRequests = async () => {
    if (activeRequests) {
      setActiveRequests(false)
      setAcceptMessage(null)
      setActivity("")
      setClassroomRequests([])
    } else {
      setActivity("user_records")
      setActiveRequests(true)
      await fetchClassroomRequests();
    }
  };

  const toggleTestDetails = async (testId) => {
    if (activeTestId === testId) {
      setActiveTestId(null);
      setActiveUserId(null);
    } else {
      setActiveTestId(testId);
      setActiveUserId(null);
      try {
        const scores = await fetchMaxScores(testId);

        if (scores) {
          setMaxScores(scores);
        } else {
          console.error('No scores found for category:', category);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  };

  const toggleUserDetails = async (userId) => {
    if (activeUserId === userId) {
      setActiveUserId(null);
    } else {
      setActiveUserId(userId);
    }
  };


  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const renderAudio = (question) => {
    if (question.question_sound) {
      return <audio controls src={question.question_sound} />;
    }
    return null;
  };



  return (
    <span>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
          <span>
            <span>
                <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                {activity === "" &&
                <>
                <label className="me-2">教室：</label> 
                <select
                  style={{ width: "150px", height: "30px" }}
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
                </>
                }
                {!activatedClassroomId && !activeUserManagement &&
                <button
                　style={{ position: 'relative',　height: '50px', width: !activeRequests ? '220px' : '290px', padding: '10px', border: '5px solid black' }}
                  className={`btn btn-warning ${activeRequests ? 'mb-5 mt-5' : 'mb-3'}`}
                  onClick={() => toggleRequests()}
                >
                  <span 
                    className="text-center text-white text_shadow">{activeRequests && <><FaArrowLeft style={{ marginRight: '10px' }} /></>}{!activeRequests ? (isEnglish ? 'Teacher requests' : '先生リクエスト') : (isEnglish ? 'Go back' : '戻る！')}
                  </span>
                </button>
                }
                {!activeUserManagement && !activeRequests && !activeCategory &&
                <button
                  style={{ height:'50px', width: !activatedClassroomId ? '220px' : '290px', padding: '10px', border: '5px solid black' }}
                  className={`btn btn-dark ${activatedClassroomId ? 'mb-5 mt-5' : 'mb-3'} toggle-classroom-btn${activatedClassroomId === activeClassroomId ? ' active' : ''}`}
                  onClick={() => toggleClassroomDetails(activeClassroomId)}
                >
                  <span className="text-center text-white text_shadow">
                    {activatedClassroomId && <><FaArrowLeft style={{ marginRight: '10px' }} /></>}{!activatedClassroomId ? (isEnglish ? 'test records' : 'テスト記録') : (isEnglish ? 'Go back' : '戻る！')}
                  </span>
                </button>
                }
                {!activatedClassroomId && !activeRequests &&
                <button
                  style={{ height: '50px', width: !activeUserManagement ? '220px' : '290px', padding: '10px', border: '5px solid black' }}
                  className={`btn btn-primary ${activeUserManagement ? 'mb-5 mt-5' : 'mb-3'}`}
                  onClick={() => toggleUserDetailsForUserDetailButton(activeClassroomId)}
                >
                  <span className="text-center text-white text_shadow">
                    {activeUserManagement && <><FaArrowLeft style={{ marginRight: '10px' }} /></>}{!activeUserManagement ? (isEnglish ? 'student management' : '生徒管理') : (isEnglish ? 'Go back' : '戻る！')}
                    </span>
                </button>
                }
                </span>
                {currentUser?.teacher.classrooms.length > 0 &&
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                {acceptMessage && <h5 className="text-center mb-2">{acceptMessage}</h5>}
                {classroomRequests.map((request) => (
                    <button
                      className="btn btn-dark mb-3 category_button"
                      onClick={() => toggleAccept(request.id, false)}
                      key={request.id}>
                        {request.teacher.user.username}
                        {request.is_accepted ? (
                            <span className="text-success" style={{ fontSize: '50px' }}>&#x2713;</span>
                        ) : (
                            <span className="text-danger" style={{ fontSize: '50px' }}>&#x2717;</span>
                        )}
                    </button>
                ))}
                {userDetailButtonActive && (
                  <>
                    {users.map(user => (
                      <span key={user.id}>
                      <button
                        style={{ height: '180px', width: '250px', padding: '10px', margin: '5px', border: '5px solid black' }}
                        className={`btn btn-success mb-3`}
                      >
                        <h5>{user.username} - {user.student.student_number}</h5>
                        <h5>最大記録トータル＝{user.total_max_scores}</h5>
                        <h5>英検トータル＝{user.total_eiken_score}</h5>
                      <button className={`btn btn-danger submit_buttons`} style={{ border: '5px solid black' }} onClick={() => openModal(user.id)}>
                        教室から追い出す
                      </button>
                      </button>
                      </span>
                    ))}
                  </>
                )}
                {activatedClassroomId === activeClassroomId && (
                  <div className="classroom-details">
                  <button
                    onClick={() => toggleCategories('japanese')}
                    className={`btn btn-success mb-3 category_button ${activeCategory === null ? 'active' : 'd-none'}`}
                  >日本語</button>
                  <button
                    onClick={() => toggleCategories('english_5')}
                    className={`btn btn-success mb-3 category_button ${activeCategory === null ? 'active' : 'd-none'}`}
                  >５年英語</button>
                  <button
                    onClick={() => toggleCategories('english_6')}
                    className={`btn btn-success mb-3 category_button ${activeCategory === null ? 'active' : 'd-none'}`}
                  >６年英語</button>
                  <button
                    onClick={() => toggleCategories('phonics')}
                    className={`btn btn-success mb-3 category_button ${activeCategory === null ? 'active' : 'd-none'}`}
                  >アルファベットとフォニックス</button>
                  <button
                    onClick={() => toggleCategories('numbers')}
                    className={`btn btn-success mb-3 category_button ${activeCategory === null ? 'active' : 'd-none'}`}
                  >数字</button>
                  <p>
                  <button
                    style={{ border: '5px solid black' }}
                    className={`btn btn-success mb-3 return_buttons ${activeCategory !== null && activeTestId === null ? 'active' : 'd-none'}`}
                    onClick={() => toggleCategories(activeCategory)}
                  >
                    <span
                      className="text-center text-white text_shadow"
                    >
                    {activeCategory}から戻る
                    </span>
                  </button>
                 </p>
                    {Object.values(tests).flat().sort((a, b) => a.lesson_number - b.lesson_number).map(test => (
                      <span key={test.id}>
                        {activeTestId === null || activeTestId === test.id ? (
                        <span style={{ marginRight: '10px' }}>
                        <button
                          className={`btn btn-warning mb-3 test_buttons ${activeTestId === test.id || activeTestId === null && activeCategory === test.category ? 'active' : 'd-none'}`}
                          onClick={() => toggleTestDetails(test.id)}
                        >
                          <span
                            className="text-center text-white text_shadow"
                          >
                            {test.name}
                          </span>
                          {test.picture_url && (
                            <img src={test.picture_url} alt="Question" width="170" height="170" />
                          )}
                        </button>
                        </span>
                        ) : null}
                        {activeTestId === test.id && (
                          <div className="test-details">
                            {users.map(user => (
                              <span key={user.id}>
                                {activeUserId === null || activeUserId === user.id ? (
                                <button
                                  className={`btn btn-success mb-3 toggle-user-btn${activeUserId === user.id ? ' active' : ''}`}
                                  style={{ height: '120px', width: '200px', padding: '10px', margin: '5px', border: '5px solid black' }}
                                  onClick={() => toggleUserDetails(user.id)}
                                >
                                  <h5>{user.username}</h5>
                                  <h5>出席番号: {user.student.student_number}</h5>
                                  {maxScores.map(score =>
                                    score.user === user.id && (
                                      <h5>最大記録：{score.score}/{score.total_questions}</h5>
                                    )
                                  )}
                                </button>
                                ) : null}
                              </span>
                            ))}
                          </div>
                        )}
                      </span>
                    ))}
                  </div>
                )}
                </div>
                }
            </span>
          </span>
      <Modal show={modalIsOpen} onHide={closeReturnModal}>
        <Modal.Body>
          <p>この生徒を本当に教室から追い出すんですか？</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeReturnModal}>いいえ</Button>
          <Button variant="primary" onClick={handleBackClick}>はい</Button>
        </Modal.Footer>
      </Modal>
    </span>
  );
};

export default UserTestRecords;