import React from "react";


const BlogPost = (props) => {
  return (
    <div className="container p-4 mt-4 bg-white rounded shadow">
      <h1 className="text-center">{props.h1}</h1>
      <p className="text-center text-muted">
        Published on <span>{new Date().toDateString()}</span> by John Doe
      </p>
      <p>
        Welcome to my first blog post! This is a simple blog template that you
        can use to share your thoughts and ideas. Customize it as you like and
        make it your own!
      </p>
      <p>Stay tuned for more updates, and feel free to comment below!</p>
    </div>
  );
};

export default BlogPost;
