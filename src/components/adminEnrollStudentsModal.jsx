import { useState } from "react";

export default function AdminEnrollStudentsModal({ closeModal }) {

  const [details, setDetails] = useState("");

  return (
    <div className="form-overlay">

      <div className="form-modal">

        {/* Close */}

        <button
          onClick={closeModal}
          className="form-close-btn"
        >
          ✕
        </button>

        <h2 className="form-title">
          Enroll Students to Batch
        </h2>

        <p className="form-subtitle">
          Add student details manually or upload a CSV file.
        </p>

        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">
              Enter Student Details *
            </label>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Enter the Details"
              className="form-control h-24"
            />
          </div>

          <p className="text-center text-sm text-gray-500">
            or
          </p>

          {/* Upload CSV */}
          <div className="form-field">
            <label className="form-label">
              Upload CSV file *
            </label>

            <div className="form-upload-zone">
              <input type="file" className="hidden" id="csvUpload"/>

              <label
                htmlFor="csvUpload"
                className="cursor-pointer text-gray-600"
              >
                Upload File
              </label>
            </div>
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
            Enroll Students
          </button>

        </div>

      </div>

    </div>
  );
}