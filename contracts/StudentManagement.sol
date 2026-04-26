// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract StudentManagement {
    struct Attendance {
        uint date;
        bool present;
    }

    struct SubjectMark {
        string subjectName;
        uint score;
    }

    mapping(address => Attendance[]) public attendanceRecords;
    mapping(address => SubjectMark[]) public studentMarks;
    mapping(address => uint) public studentMarkUpdates;
    mapping(address => bool) public isTeacher;
    
    address public owner;

    event AttendanceMarked(address indexed student, bool present, uint date);
    event MarksAdded(address indexed student, uint timestamp);

    modifier onlyTeacher() {
        require(isTeacher[msg.sender], "Only teacher can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
        isTeacher[msg.sender] = true;
    }

    function setTeacher(address _teacher) external {
        require(msg.sender == owner, "Only owner can set teacher");
        isTeacher[_teacher] = true;
    }

    function markAttendance(address student, bool present) external onlyTeacher {
        uint currentDate = block.timestamp;
        attendanceRecords[student].push(Attendance({
            date: currentDate,
            present: present
        }));
        emit AttendanceMarked(student, present, currentDate);
    }

    function getAttendance(address student) external view returns (Attendance[] memory) {
        return attendanceRecords[student];
    }

    function getTotalClasses(address student) external view returns (uint) {
        return attendanceRecords[student].length;
    }

    function addMarks(address student, string[] calldata subjects, uint[] calldata scores) external onlyTeacher {
        require(subjects.length == scores.length, "Arrays length mismatch");
        
        // Delete previous marks to overwrite
        delete studentMarks[student];
        
        for(uint i = 0; i < subjects.length; i++) {
            studentMarks[student].push(SubjectMark({
                subjectName: subjects[i],
                score: scores[i]
            }));
        }
        
        uint currentTimestamp = block.timestamp;
        studentMarkUpdates[student] = currentTimestamp;
        
        emit MarksAdded(student, currentTimestamp);
    }

    function getMarks(address student) external view returns (SubjectMark[] memory, uint) {
        return (studentMarks[student], studentMarkUpdates[student]);
    }

    function verifyStudent(address student) external view returns (Attendance[] memory, SubjectMark[] memory, uint) {
        return (attendanceRecords[student], studentMarks[student], studentMarkUpdates[student]);
    }
}
