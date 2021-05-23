import React, { useState, useEffect, useRef } from "react";
import "./SearchBar.scss";
import { List, ListItem, ListItemText } from "@material-ui/core";
import PersonIcon from "@material-ui/icons/Person";
import GitHubIcon from "@material-ui/icons/GitHub";

export const SearchBar = () => {
  const [items, setItems] = useState([]);
  const [failure, setFailure] = useState(false);
  const [activeItem, setActiveItem] = useState(-1);
  const [resultsVisible, setResultsVisible] = useState(false);
  const listWrapperRef = useRef(null);
  const listItemRef = useRef(null);

  document.onkeydown = (e) => {
    switch (e.key) {
      case "ArrowUp":
        setActiveItem(activeItem - 1);
        break;
      case "ArrowDown":
        setActiveItem(activeItem + 1);
        break;
    }
  };

  // Helper function to determine enter press on a listItem
  const useEnterClickDetect = (ref) => {
    document.addEventListener("keyup", function (event) {
      if (ref.current && !ref.current.contains(event.target)) {
        if (event.key === "Enter") {
          // Cancel the default action, if needed
          event.preventDefault();
          // Trigger the button element with a click
          document.getElementById("listItem").click();
        }
      }
    });
  };

  useEnterClickDetect(listItemRef);

  // Helper function to determine click outside of query result table
  const useOutsideClickDetect = (ref) => {
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          setResultsVisible(false);
          setActiveItem(activeItem - 1);
        }
      };

      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  };

  useOutsideClickDetect(listWrapperRef);

  //  Map query results into ListItems with proper icons
  const children =
    items.length === 0 ? (
      <div>No results found</div>
    ) : (
      items.map((item, index) => (
        <ListItem
          id="listItem"
          key={index}
          button
          type="submit"
          component="button"
          href={item.url}
          ref={listItemRef}
        >
          <ListItemText className={activeItem === index ? "active" : ""}>
            {item.type === "user" ? (
              <PersonIcon style={{ fontSize: 20, color: "#282c34" }} />
            ) : (
              <GitHubIcon style={{ fontSize: 20, color: "#282c34" }} />
            )}
            <span className="listItemText">{item.name}</span>
          </ListItemText>
        </ListItem>
      ))
    );

  // Queries for GitHub repositories and users
  const getGitHubItems = async (param) => {
    Promise.all([
      fetch(
        `https://api.github.com/search/repositories?q=${param}&sort=start&order=asc&per_page=50`
      ),
      fetch(
        `https://api.github.com/search/users?q=${param}&sort=login&order=asc&per_page=50`
      ),
    ])
      .then(async ([reposResult, usersResult]) => {
        const reposResultJson = await reposResult.json();
        const usersResultJson = await usersResult.json();
        return [reposResultJson, usersResultJson];
      })
      .then((result) => {
        // Merge repository and user lists
        return result[0].items
          .map((item) => ({
            type: "repo",
            name: item.name,
            url: item.html_url,
          }))
          .concat(
            result[1].items.map((item) => ({
              type: "user",
              name: item.login,
              url: item.html_url,
            }))
          );
      })
      // Sort items and slice the list to contain 50 items
      .then((allItems) => {
        const sortedItems = allItems
          .sort((a, b) => (a.name > b.name ? 1 : -1))
          .slice(0, 50);
        setItems(sortedItems);
        sortedItems.length === 0 ? setFailure(true) : setFailure(false);
      })
      // 'handle errors'
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="searchbar-container">
      <div className="searchbar-title">Search for GitHub repos or users</div>
      <input
        className={"searchbar-textfield" + (!failure ? "" : " failure")}
        minLength="3"
        onChange={async (event) => {
          if (event.target.value.length >= 3) {
            await getGitHubItems(event.target.value);
            setResultsVisible(true);
          } else {
            setResultsVisible(false);
          }
        }}
      />
      <span className="border" />
      {resultsVisible ? <List ref={listWrapperRef}>{children}</List> : null}
    </div>
  );
};
