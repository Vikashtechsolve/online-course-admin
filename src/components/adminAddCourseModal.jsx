import { useState } from "react";

export default function AdminAddCourseModal({ closeModal }) {

  const [course, setCourse] = useState({
    title: "",
    description: "",
    teacher: "",
    coordinator: ""
  });

  const handleChange = (e) => {

    setCourse({
      ...course,
      [e.target.name]: e.target.value
    });

  };

  return (
    <div className="form-overlay">

      <div className="form-modal">

        <button
          onClick={closeModal}
          className="form-close-btn"
        >
          ✕
        </button>

        <h2 className="form-title">
          Add New Courses
        </h2>

        <p className="form-subtitle">
          Create a course and assign teacher/coordinator details.
        </p>

        <div className="form-grid">

          <div className="form-field">
            <label className="form-label">Course Title</label>
          <input
            name="title"
            placeholder="Enter the Course Title"
            onChange={handleChange}
              className="form-control"
          />
          </div>

          <div className="form-field">
            <label className="form-label">Description</label>
          <textarea
            name="description"
            placeholder="Enter the Description"
            onChange={handleChange}
              className="form-control h-24"
          />
          </div>

          {/* Teacher */}
          <div className="form-field">
            <label className="form-label">Teacher</label>

          <select
            name="teacher"
            onChange={handleChange}
              className="form-control"
          >

            <option>Select the Teacher</option>
            <option>Vikash Dubey</option>
            <option>Amit Vaghamshi</option>

          </select>
          </div>

          {/* Coordinator */}
          <div className="form-field">
            <label className="form-label">Course Coordinator</label>

          <select
            name="coordinator"
            onChange={handleChange}
              className="form-control"
          >

            <option>Select Course Coordinator</option>
            <option>Pravin Kumar</option>
            <option>Vikram Jain</option>

          </select>
          </div>

        </div>

        {/* Buttons */}

        <div className="form-actions">

          <button
            onClick={closeModal}
            className="form-btn-secondary"
          >
            Cancel
          </button>

          <button className="form-btn-primary">
            Add Course
          </button>

        </div>

      </div>

    </div>
  );
}