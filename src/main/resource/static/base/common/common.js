cola.setting("pagingParamStyle", "from");

cola.on("beforeInit", function() {
	if (window.$codeValues) {
		for (var type in $codeValues) {
			if ($codeValues.hasOwnProperty(type)) {
				cola.util.dictionary(type, $codeValues[type]);
			}
		}
	}
});