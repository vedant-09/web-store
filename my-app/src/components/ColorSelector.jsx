const ColorSelector = ({ colors, selectedColor, onSelect }) => {
  return (
    <div className="d-flex gap-2 mt-1">
      {colors.map((color, index) => (
        <div
          key={index}
          className={`rounded-circle border ${selectedColor === color ? "border-dark border-3" : ""}`}
          onClick={() => onSelect(color)}
          style={{
            backgroundColor: color.toLowerCase(),
            width: "30px",
            height: "30px",
            cursor: "pointer"
          }}
          title={color}
        />
      ))}
    </div>
  );
};

export default ColorSelector;
