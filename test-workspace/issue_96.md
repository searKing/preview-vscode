<h1>
Standards
</h1>

<ol>

	<li>
	<details open>
	<summary>
	<h2>
	Spectacle
	</h2>
	</summary>
	<div class="block-indent">

	<p>Unfortunately, all calendar names are hardcoded.</p>

	<ol>

	<li>
		<details open>
			<summary>
				<h2>
					Screencast
				</h2>
			</summary>
			<div class="block-indent">

	```PS1
	@{'Type'='Screencast'; 'Date'='+<yyyy><MM><dd>T<hh><mm><ss><tt>'}#
	```

    ```go
    import time
    ```

	</div>
	</details>
	</li>

	<li>
		<details open>
			<summary>
				<h2>
					Screenshot
				</h2>
			</summary>
			<div class="block-indent">

	```PS1
	@{'Type'='Screenshot'; 'Date'='+<yyyy><MM><dd>T<hh><mm><ss><tt>'}#
	```

	</div>
	</details>
	</li>

	</ol>

	</div>
	</details>
	</li>

	<li>
		<details open>
			<summary>
				<h2>
					<code>
						obs-studio
					</code>
				</h2>
			</summary>
			<div class="block-indent">

	```PS1
	@{'Type'='Screencast'; 'Date'='+%CCYY%MM%DDT%hh%mm%ss%z'}#
	```

	<p>I don't know how to add a timezone name to this.</p>

	</div>
	</details>
	</li>

</ol>