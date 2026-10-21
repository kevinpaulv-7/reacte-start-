import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [flippedCar, setFlippedCar] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/v1/vehicles/?page=${currentPage}&per_page=15`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(`Request failed (${response.status}). Please try again.`);
        }

        if (!Array.isArray(result.results?.cars)) {
          throw new Error('The API response did not include a car list.');
        }

        if (!ignore) {
          setData(result.results.cars);
          setTotalPages(result.results.total_pages || 1);
        }
      } catch (error) {
        if (!ignore) setError(error.message || 'Could not load vehicles.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchData();
    return () => { ignore = true; };
  }, [currentPage]);

  const filteredData = data.filter((item) => {
    const carInfo = `${item.make} ${item.model} ${item.loc} ${item.dealer}`.toLowerCase();
    return carInfo.includes(searchText.trim().toLowerCase());
  });

  const handleSearch = (event) => {
    event.preventDefault();
    setCurrentPage(1);
  };

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">Piston Traders</p>
        <h1>Find your next car</h1>
        <p className="subtitle">Browse our available vehicles.</p>
      </header>
      <form className="search-form" onSubmit={handleSearch}>
        <label htmlFor="vehicle-search">Search vehicles on this page</label>
        <div className="search-controls">
          <input
            id="vehicle-search"
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Try make, model, or location"
          />
          <button className="search-button" type="submit">Search</button>
        </div>
      </form>

      {error && <p className="notice error">Could not load vehicles: {error}</p>}
      {loading && <p className="notice">Loading vehicles...</p>}
      {!loading && !error && filteredData.length === 0 && (
        <p className="notice">
          {searchText ? 'No vehicles match your search on this page.' : 'No vehicles found.'}
        </p>
      )}

      <section className="vehicle-grid">
        {!loading && !error && filteredData.map((item) => {
          const isFlipped = flippedCar === item.row_id;
          const carName = `${item.make} ${item.model}`;

          return (
            <div className="vehicle-card" key={item.row_id}>
              <div className={`vehicle-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
                <div className="vehicle-face vehicle-card-front">
                  <div className="vehicle-image-wrap">
                    {item.thumbnail && (
                      <img
                        className="vehicle-image"
                        src={item.thumbnail}
                        alt={carName}
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                          event.currentTarget.nextSibling.style.display = 'grid';
                        }}
                      />
                    )}
                    <div className="vehicle-avatar" style={{ display: item.thumbnail ? 'none' : 'grid' }}>
                      {item.make?.charAt(0).toUpperCase() || '?'}
                    </div>
                  </div>

                  <div className="vehicle-content">
                    <h2 title={carName}>{carName}</h2>
                    <button
                      className="details-button"
                      type="button"
                      onClick={() => setFlippedCar(item.row_id)}
                    >
                      Show details
                    </button>
                  </div>
                </div>

                <div className="vehicle-face vehicle-card-back" aria-hidden={!isFlipped}>
                  <div className="back-header">
                    <h2>{carName}</h2>
                    <button
                      className="details-button back-button"
                      type="button"
                      onClick={() => setFlippedCar(null)}
                    >
                      Back
                    </button>
                  </div>
                  <div className="vehicle-details">
                    <p><strong>Year:</strong> {item.year || 'Not listed'}</p>
                    <p><strong>Price:</strong> £{item.price || 'Not listed'}</p>
                    <p><strong>Mileage:</strong> {item.mileage ? `${item.mileage} miles` : 'Not listed'}</p>
                    <p><strong>Fuel:</strong> {item.fuel_type || 'Not listed'}</p>
                    <p><strong>Transmission:</strong> {item.transmission || 'Not listed'}</p>
                    <p><strong>Engine:</strong> {item.engine_size || 'Not listed'}</p>
                    <p><strong>Location:</strong> {item.loc || 'Not listed'}</p>
                    <p><strong>Dealer:</strong> {item.dealer || 'Not listed'}</p>
                    {item.full_description && <p>{item.full_description}</p>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {!loading && !error && totalPages > 1 && (
        <div className="pagination" aria-label="Vehicle pages">
          <button
            className="page-button"
            type="button"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            className="page-button"
            type="button"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}

export default App;
