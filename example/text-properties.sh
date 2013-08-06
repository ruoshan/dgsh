#!/usr/local/bin/sgsh
#
# SYNOPSIS Text properties
# DESCRIPTION
# Read text from the standard input and create files
# containing word, character, digram, and trigram frequencies.
#
# Demonstrates the use of scatter blocks without output
#
# Example:
# curl ftp://sunsite.informatik.rwth-aachen.de/pub/mirror/ibiblio/gutenberg/1/3/139/139.txt | text-properties
#
#  Copyright 2013 Diomidis Spinellis
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#

# Consitent sorting across machines
export LC_ALL=C


# Convert input into a ranged frequency list
ranked_frequency()
{
	sort |
	uniq -c |
	sort -rn
}

# Convert standard input to a ranked frequency list of specified n-grams
ngram()
{
	local N=$1

	perl -ne 'for ($i = 0; $i < length($_) - '$N'; $i++) {
		print substr($_, $i, '$N'), "\n";
	}' |
	ranked_frequency
}

scatter |{
	# Split input one word per line
	-| tr -cs a-zA-Z \\n |{
		# Digram frequency
		-| ngram 2 >digram.txt |.
		# Trigram frequency
		-| ngram 3 >trigram.txt |.
		# Word frequency
		-| ranked_frequency >words.txt |.
	|}
	# Character frequency
	-| sed 's/./&\
/g' |
	   ranked_frequency >character.txt |.
|} gather |{
|}
