import Header from '../components/header.jsx';

const Layout = ({ children }) => {
  const handleSearch = (query) => {
    console.log('Search query:', query);
    // Implement your search logic here
  };

  return (
    <div>
      <Header onSearch={handleSearch} />
      <main>{children}</main>
    </div>
  );
};

export default Layout;