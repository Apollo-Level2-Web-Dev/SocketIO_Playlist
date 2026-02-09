import { useState } from "react";
import { menuItems, categories } from "../../utils/menuData";

const Menu = ({ onAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Welcome to FoodTrack 🍽️
        </h1>
        <p className="text-xl text-gray-600">
          Order your favorite food and track it in real-time!
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full font-medium transition transform hover:scale-105 ${
              selectedCategory === category
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 shadow"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            {/* Item Image/Emoji */}
            <div className="bg-linear-to-br from-blue-50 to-blue-100 h-40 flex items-center justify-center">
              <span className="text-7xl">{item.image}</span>
            </div>

            {/* Item Details */}
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {item.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4 h-12">
                {item.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  ${item.price.toFixed(2)}
                </span>
                <button
                  onClick={() => onAddToCart(item)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition transform hover:scale-105 active:scale-95"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-2xl text-gray-500">
            No items found in this category
          </p>
        </div>
      )}
    </div>
  );
};

export default Menu;
