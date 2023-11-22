function mapTools(tools) {
    if (Array.isArray(tools) && tools.length > 1) {
      return tools.map(tool => {
        return { type: tool }; // Assuming 'type' is the correct field name
      });
    } else {
      return [{ type: tools }]; // Ensure even a single tool is in array of object format
    }
}

module.exports = mapTools;