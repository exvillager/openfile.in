export const downloadKeyFile = (link: string, key: string, iv: string) => {
  try {
    const content = JSON.stringify({
      link: link,
      key: key,
      iv: iv,
    });
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `openfile-key-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error while downloading key file", error);
  }
};
