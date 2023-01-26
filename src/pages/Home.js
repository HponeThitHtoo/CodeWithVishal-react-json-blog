import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { MDBRow, MDBCol, MDBContainer, MDBTypography } from "mdb-react-ui-kit";

import Blogs from "../components/Blogs";
import Search from "../components/Search";
import Category from "../components/Category";
import LatestBlog from "../components/LatestBlog";
import Pagination from "../components/Pagination";

const options = ["Travel", "Fashion", "Fitness", "Sports", "Food", "Tech"];

const Home = () => {
  const [data, setData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [latestBlog, setLatestBlog] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalBlog, setTotalBlog] = useState(null);
  const [pageLimit] = useState(5);

  useEffect(() => {
    loadBlogsData(0, 5, 0);
    fetchLatestBlog();
  }, []);

  const loadBlogsData = async (start, end, increase, operation) => {
    // for pagination
    const totalBlog = await axios.get("http://localhost:5000/blogs");
    setTotalBlog(totalBlog.data.length);

    // load data
    const response = await axios.get(
      `http://localhost:5000/blogs?_start=${start}&_end=${end}`
    );
    if (response.status === 200) {
      setData(response.data);
      if (operation === "delete") {
        setCurrentPage(0);
      } else {
        setCurrentPage(currentPage + increase);
      }
    } else {
      toast.error("Something went wrong loading blogs data!");
    }
  };

  const fetchLatestBlog = async () => {
    const totalBlog = await axios.get("http://localhost:5000/blogs");
    const start = totalBlog.data.length - 4;
    const end = totalBlog.data.length;
    const response = await axios.get(
      `http://localhost:5000/blogs?_start=${start}&_end=${end}`
    );
    if (response.status === 200) {
      setLatestBlog(response.data);
    } else {
      toast.error("Something went wrong getting latest blogs");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure that you wanted to delete that blog?")) {
      const response = await axios.delete(`http://localhost:5000/blogs/${id}`);
      if (response.status === 200) {
        toast.success("Blog Deleted Successfully");
        loadBlogsData(0, 5, 0, "delete");
      } else {
        toast.error("Something went wrong deleting the blog!");
      }
    }
  };

  const excerpt = (str) => {
    if (str.length > 50) {
      str = str.substring(0, 50) + " ...";
    }
    return str;
  };

  const onInputChange = (e) => {
    if (!e.target.value) {
      loadBlogsData(0, 5, 0);
    }
    setSearchValue(e.target.value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const response = await axios.get(
      `http://localhost:5000/blogs?q=${searchValue}`
    );
    if (response.status === 200) {
      setData(response.data);
    } else {
      toast.error("Something went wrong searching!");
    }
  };

  const handleCategory = async (category) => {
    const response = await axios.get(
      `http://localhost:5000/blogs?category=${category}`
    );
    if (response.status === 200) {
      setData(response.data);
    } else {
      toast.error("Something went wrong searched by category");
    }
  };

  // console.log(data);

  return (
    <>
      <Search
        searchValue={searchValue}
        onInputChange={onInputChange}
        handleSearch={handleSearch}
      />
      <MDBRow>
        {data.length === 0 && (
          <MDBTypography className="text-center mb-0" tag="h2">
            No Blog Found
          </MDBTypography>
        )}
        <MDBCol>
          <MDBContainer>
            <MDBRow>
              {data &&
                data.map((item, index) => (
                  <Blogs
                    key={index}
                    {...item}
                    excerpt={excerpt}
                    handleDelete={handleDelete}
                  />
                ))}
            </MDBRow>
          </MDBContainer>
        </MDBCol>
        <MDBCol size="3">
          <h4 className="text-start">Latest Post</h4>
          {latestBlog &&
            latestBlog.map((item, index) => (
              <LatestBlog key={index} {...item} />
            ))}
          <Category options={options} handleCategory={handleCategory} />
        </MDBCol>
      </MDBRow>
      <div className="mt-3">
        <Pagination
          currentPage={currentPage}
          loadBlogsData={loadBlogsData}
          pageLimit={pageLimit}
          data={data}
          totalBlog={totalBlog}
        />
      </div>
    </>
  );
};

export default Home;
