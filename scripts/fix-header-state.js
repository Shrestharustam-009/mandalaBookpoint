const fs = require('fs');
const path = require('path');

const headerFile = path.join(__dirname, '../components/Header.jsx');
let content = fs.readFileSync(headerFile, 'utf8');

// The exact string to replace
const oldStateBlock = `  const { getCartItemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartItemCount = getCartItemCount();`;

const newStateBlock = `  const { getCartItemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartItemCount = getCartItemCount();

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const results = await api.books.search(searchQuery);
          setSearchResults(results.slice(0, 5));
        } catch (err) {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(\`/books?search=\${encodeURIComponent(searchQuery)}\`);
    }
  };`;

// Use a simple split/join in case of exact match issues, or just a regex
content = content.replace(/const \{ getCartItemCount \} = useCart\(\);\s+const \[menuOpen, setMenuOpen\] = useState\(false\);\s+const cartItemCount = getCartItemCount\(\);/, newStateBlock);

fs.writeFileSync(headerFile, content, 'utf8');
console.log('Fixed Header.jsx state block!');
