import { useEffect, useState } from "react";
import { MDBValidation, MDBInput, MDBTextArea, MDBBtn } from "mdb-react-ui-kit";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const initialState = {
  title: "",
  description: "",
  category: "",
  imageUrl: "",
};

const options = ["Travel", "Fashion", "Fitness", "Sports", "Food", "Tech"];

const AddEditBlog = () => {
  const [formValue, setFormValue] = useState(initialState);
  const [categoryErrMsg, setCategoryErrMsg] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const { title, description, category, imageUrl } = formValue;

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setEditMode(true);
      getSingleBlog(id);
    } else {
      setEditMode(false);
      setFormValue({ ...initialState });
    }
  }, [id]);

  const getSingleBlog = async (id) => {
    const singleBlog = await axios.get(`http://localhost:5000/blogs/${id}`);
    if (singleBlog.status === 200) {
      console.log(singleBlog.data);
      setFormValue({ ...singleBlog.data });
    } else {
      toast.error("Something went wrong getting single blog");
    }
  };

  const getDate = () => {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, "0");
    let mm = String(today.getMonth()).padStart(2, "0"); // January is 0!
    let yyyy = today.getFullYear();

    today = mm + "/" + dd + "/" + yyyy;
    return today;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) {
      setCategoryErrMsg("Please select a category");
    }

    const imageValidation = !editMode ? imageUrl : true;

    if (title && description && imageUrl && category) {
      const currentDate = getDate();

      if (!editMode) {
        const updatedBlogData = { ...formValue, date: currentDate };
        const response = await axios.post(
          "http://localhost:5000/blogs",
          updatedBlogData
        );
        if (response.status === 201) {
          toast.success("Blog Created Successfully");
        } else {
          toast.error("Something went wrong in posting to db.json");
        }
      } else {
        const response = await axios.put(
          `http://localhost:5000/blogs/${id}`,
          formValue
        );
        if (response.status === 200) {
          toast.success("Blog Updated Successfully");
        } else {
          toast.error("Something went wrong in updating to db.json");
        }
      }
      setFormValue({ title: "", description: "", category: "", imageUrl: "" });
      navigate("/");
    }
  };

  const onInputChange = (e) => {
    let { name, value } = e.target;
    setFormValue({ ...formValue, [name]: value });
  };

  const onUploadImage = (file) => {
    // console.log("file", file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.REACT_APP_UPLOAD_PRESET);
    axios
      .post(
        `http://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_KEY}/image/upload`,
        formData
      )
      .then((resp) => {
        toast.info("Image Uploaded Successfully to cloudinary");
        setFormValue({ ...formValue, imageUrl: resp.data.url });
      })
      .catch((err) => {
        toast.error("Something went wrong in uploading image to cloudinary!");
      });
  };

  const onCategoryChange = (e) => {
    setCategoryErrMsg(null);
    setFormValue({ ...formValue, category: e.target.value });
  };

  return (
    <MDBValidation
      className="row g-3"
      style={{ marginTop: "100px" }}
      noValidate
      onSubmit={handleSubmit}
    >
      <p className="fs-2 fw-bold">{editMode ? "Update Blog" : "Add Blog"}</p>

      <div
        style={{
          margin: "auto",
          padding: "15px",
          maxWidth: "400px",
          alignContent: "center",
        }}
      >
        <MDBInput
          value={title || ""}
          name="title"
          type="text"
          onChange={onInputChange}
          required
          label="Title"
          validation="Please provide a title"
          invalid
        />
        <br />
        {/* <MDBInput
          value={description || ""}
          name="description"
          type="text"
          onChange={onInputChange}
          required
          label="Description"
          validation="Please provide a description"
          textarea
          rows={4}
          invalid
        /> */}
        <MDBTextArea
          value={description || ""}
          name="description"
          onChange={onInputChange}
          required
          label="Description"
          validation="Please provide a description"
          rows={4}
          invalid
        />
        <br />
        {!editMode && (
          <>
            <MDBInput
              type="file"
              onChange={(e) => onUploadImage(e.target.files[0])}
              required
              validation="Please provide an image"
              invalid
            />
            <br />
          </>
        )}

        <select
          className="categoryDropdown"
          onChange={onCategoryChange}
          value={category}
        >
          <option value="">Please select category</option>
          {options.map((option, index) => (
            <option value={option || ""} key={index}>
              {option}
            </option>
          ))}
        </select>

        {categoryErrMsg && (
          <div className="categoryErrorMsg">{categoryErrMsg}</div>
        )}

        <br />
        <br />
        <MDBBtn type="submit" style={{ marginRight: "10px" }}>
          {editMode ? "Update" : "Add"}
        </MDBBtn>
        <MDBBtn
          color="danger"
          style={{ marginRight: "10px" }}
          onClick={() => navigate("/")}
        >
          Go Back
        </MDBBtn>
      </div>
    </MDBValidation>
  );
};

export default AddEditBlog;
