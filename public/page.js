$.getJSON('http://api.ipstack.com/check?access_key=42bf0cf42905d6032da23aa2df2e694e')
	.done(response => {
		$('input[name="ip"]').val( response.ip )
	})

$('form').on('submit', function(e) {
	$('[type="submit"]').attr('disabled', true);
})