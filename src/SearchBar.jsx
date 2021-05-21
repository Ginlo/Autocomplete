import React, { useState, useEffect, useRef } from "react";
import "./SearchBar.scss";
import { List, ListItem, ListItemText } from "@material-ui/core";
import PersonIcon from "@material-ui/icons/Person";
import GitHubIcon from "@material-ui/icons/GitHub";

export const SearchBar = () => {
  const [items, setItems] = useState([]);
  const [failure, setFailure] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);
  const wrapperRef = useRef(null);

  // Helper function to determine click outside of query result table
  const useOutsideClickDetect = (ref) => {
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          setResultsVisible(false);
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

  useOutsideClickDetect(wrapperRef);

  //  Map query results into ListItems with proper icons
  const children =
    items.length === 0 ? (
      <div>No results found</div>
    ) : (
      items.map((item, index) => (
        <a href={item.url}>
          <ListItem key={index}>
            <ListItemText>
              {item.type === "user" ? (
                <PersonIcon style={{ fontSize: 20, color: "#282c34" }} />
              ) : (
                <GitHubIcon style={{ fontSize: 20, color: "#282c34" }} />
              )}
              <span className="listItemText">{item.name}</span>
            </ListItemText>
          </ListItem>
        </a>
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
      <div className="searchbar-placeholder">
        Search for GitHub repos or users
      </div>
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
      {resultsVisible ? <List ref={wrapperRef}>{children}</List> : null}
    </div>
  );
};
