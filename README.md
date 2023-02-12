# Auctioneer
A MERN (MongoDB, Express, React & Node.JS) stack application created for the [Northside Wizards](https://northsidewizards.com) to list auctions on their website within an iframe. *But can pretty much be edited to fit anyone...*

Note: There are some things that are specific to the Northside Wizards. It is being worked on to be more generic, but it is not a priority at the time of this commit.

### Some main dot points of what this does and does not do:
- Allows users to login with a phone number and verification code sent via SMS.
- Does **not** handle payment information or transactions for when a bid wins.
- All the basic auction features such as a starting price, reserve price & close on finish time.
- SMS notifications when a user subscribes to a listing, to recieve notifications for when the listing is getting close to finishing, when they've been outbid, when the listing finishes and if they've won.
- Configured to Australia mobile numbers only. (But this is planned to be configurable or global)

### Requirements before running
- MongoDB
- (Suggested) Nginx or Apache to proxy pass

### Setup & running
1. Clone the repo and open the top folder (that contains the `/apps` & `/shared` folders) in the terminal
2. Install the packages using `npm install`
4. Rename `.env.template` to `.env` and open the file to configure how you need and add your own Twilio API keys for SMS.
5. Run `npm start` to start the application.

### Support
Feel free to make any PR's for additional featues or fixes to mistakes I've made...

[❤️ **You can also sponsor me if you like my work, Thanks!**](https://github.com/sponsors/zacimac)