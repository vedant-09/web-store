const SizeSelector = ({ sizes, selectedSize, onSelect }) => {
  return (
    <div className="d-flex gap-2 mt-1">
      {sizes.map((size, index) => (
        <div
          key={index}
          className={`px-3 py-1 border rounded ${selectedSize === size ? "bg-dark text-white" : "bg-white"}`}
          onClick={() => onSelect(size)}
          style={{ cursor: "pointer" }}
        >
          {size}
        </div>
      ))}
    </div>
  );
};

export default SizeSelector;
