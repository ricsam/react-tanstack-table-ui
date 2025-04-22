import slow from "./slow.png";
import fast from "./fast.png";

export const Images = () => {
  return (
    <div className="flex w-full gap-4">
      <div className="flex-1">
        <img src={slow} alt="Slow" className="object-contain" />
        <pre className="text-xs text-gray-200">
          Scripting:  278ms
          <br />
          Rendering:  142ms
          <br />
          Painting:   28ms
          <br />
          System:     41ms
          <br />
          Messaging:  1ms
          <br />
          Total:      500ms
        </pre>
        <p className="text-sm text-gray-500">
          Figure 1: Scrolling using sticky columns with normal document flow
        </p>
      </div>
      <div className="flex-1">
        <img src={fast} alt="Fast" className="object-contain" />
        <pre className="text-xs text-gray-200 ">
          Scripting:  176ms
          <br />
          Rendering:  81ms
          <br />
          Painting:   41ms
          <br />
          System:     39ms
          <br />
          Messaging:  1ms
          <br />
          Total:      500ms
        </pre>
        <p className="text-sm text-gray-500">
          Figure 2: Scrolling using absolute positioned cells and javascript
        </p>
      </div>
    </div>
  );
};
