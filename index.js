/**
 *
 * The Bipio Trello Pod
 *
 * @author Michael Pearson <michael@cloudspark.com.au>
 * Copyright (c) 2010-2014 CloudSpark pty ltd http://www.cloudspark.com.au
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var Pod = require('bip-pod'),
https = require('https'),
querystring = require('querystring'),
Q = require('q'),

Trello = new Pod({
  name : 'trello',
  description : 'Trello',
  description_long : '<a href="https://www.trello.com">Trello</a> is the easiest way to organize anything with anyone.',
  authType : 'oauth',
  passportStrategy : require('passport-trello').Strategy,
  config : {
    "oauth": {
      "consumerKey" : "",
      "consumerSecret" : "",
      "trelloParams" : {
        "scope": "read,write",
        "expiration": "never"
      }
    }
  },
  'renderers' : {
    'member_boards' : {
      description : 'Retrieve Boards',
      contentType : DEFS.CONTENTTYPE_JSON
    },
    
    'board_lists' : {
      description : 'Retrieve Lists For a Board',
      contentType : DEFS.CONTENTTYPE_JSON,
      properties : {
        board_id : {
          description : 'Board ID',
          type : 'string',
          oneOf : [
            {
              '$ref' : '/renderers/member_boards#{id}'
            }
          ],
          required : true
        }
      }
    },
    'all_board_lists' : {
      description : 'Retrieve All Lists For Active Boards',
      contentType : DEFS.CONTENTTYPE_JSON
    }
  }
});

Trello.getParameters = function(path, query, sysImports) {
  var config = this.getConfig();

  var auth = {
    token : sysImports.auth.oauth.token,
    key : config.oauth.consumerKey
  };

  return '/1/'
  + path
  + '?'
  + querystring.stringify(auth)
  + '&'
  + querystring.stringify(query);
}

Trello.trelloRequest = function(path, params, sysImports, next, method) {
  var opts = {
    host: 'api.trello.com',
    port: 443,
    path: this.getParameters(path, params, sysImports),
    method: method || 'GET'
  };

  https.request(opts, next).end();
}

Trello.trelloRequestParsed = function(path, params, sysImports, next, method) {
  this.trelloRequest(path, params, sysImports, function(res) {
    res.setEncoding('utf8');
    var data = "";
    res.on('data', function(d) {
      data += d;
    });
    res.on("end", function() {
      if(res.statusCode !== 200) {
        next(data);
      } else {
        next(false, JSON.parse(data));
      }
    });
  }, method);
}

Trello.rpc = function(action, method, sysImports, options, channel, req, res) {
  var podConfig = this.getConfig(),
  self = this,
  profile = JSON.parse(sysImports.auth.oauth.profile),
  opts;

  if (method == 'member_boards') {
    this.trelloRequest(
      'members/' + profile.id + '/boards',
      {},
      sysImports,
      function(tRes) {
        tRes.pipe(res);
      }
    );

  } else if (method == 'board_lists') {
    this.trelloRequest(
      'boards/' + req.query.board_id + '/lists',
      {},
      sysImports,
      function(tRes) {
        tRes.pipe(res);
      }
    );

  // we don't have a schema client that can follow refs from
  // boards > lists hierarchically, so need to cheat a litte...
  } else if (method == 'all_board_lists') {

    self.trelloRequestParsed(
      'members/' + profile.id + '/boards',
      {},
      sysImports,
      function(err, boards) {
        if (err) {
          res.send(err, 500);
          res.end();
        } else {
          var promises = [],
            activeLists = [];

          for (var i = 0; i < boards.length; i++) {
            if (!boards[i].closed) {
              deferred = Q.defer();
              promises.push(deferred.promise);

              (function(deferred, board, activeLists) {
                self.trelloRequestParsed(
                  'boards/' + board.id + '/lists',
                  {},
                  sysImports,
                  function(err, lists) {
                    if (err) {
                      deferred.reject();
                    } else {
                      // augment the list name with a useful path
                      for (var i = 0; i < lists.length; i++) {
                        if (!lists[i].closed) {
                          lists[i].name_path = board.name + ' > ' + lists[i].name;
                          activeLists.push(lists[i]);
                        }
                      }
                      deferred.resolve();                    
                    }
                  }
                );  
              })(deferred, boards[i], activeLists); 
            }
          }
          
          Q.all(promises).then(
            function() {
              res.send(activeLists)
            },
            function(err) {
              res.send(err, 500);
          });
        }
      }
    );


  } else {
    this.__proto__.rpc.apply(this, arguments);
  }
}

// Include any actions
Trello.add(require('./create_board.js'));
Trello.add(require('./create_list.js'));
Trello.add(require('./create_card.js'));

Trello.add(require('./add_comment.js'));

// -----------------------------------------------------------------------------
module.exports = Trello;
